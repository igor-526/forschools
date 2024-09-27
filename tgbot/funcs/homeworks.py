import datetime

from aiogram import types
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from django.db.models import Q

from lesson.models import Lesson
from tgbot.funcs.fileutils import filechecker, filedownloader
from tgbot.funcs.materials import show_material_item
from tgbot.keyboards.callbacks.homework import HomeworkCallback
from tgbot.keyboards.homework import (get_homework_item_buttons, get_homeworks_buttons,
                                      get_hwlogs_buttons, get_homework_menu_buttons, get_homework_lessons_buttons,
                                      get_homework_newhwsetting_buttons)
from tgbot.keyboards.default import cancel_keyboard, yes_cancel_keyboard, message_typing_keyboard
from tgbot.finite_states.homework import HomeworkFSM, HomeworkNewFSM
from tgbot.funcs.menu import send_menu
from tgbot.models import TgBotJournal
from tgbot.utils import get_tg_id
from profile_management.models import NewUser, Telegram
from homework.models import Homework, HomeworkLog
from tgbot.create_bot import bot
from tgbot.utils import get_group_and_perms, get_user
from homework.utils import status_code_to_string
from material.utils.get_type import get_type
from aiogram.utils.media_group import MediaGroupBuilder


async def homeworks_send_menu(message: types.Message, state: FSMContext):
    user = await get_user(message.from_user.id)
    perms = await get_group_and_perms(user.id)
    if "Listener" in perms.get("groups"):
        await show_homework_queryset(message.from_user.id, state)
    elif "Teacher" in perms.get("groups"):
        await message.answer(text="Выберите функцию:",
                             reply_markup=get_homework_menu_buttons())
    else:
        await message.answer("Функция для Вашей роли недоступна")


async def add_homework_select_lesson(callback: CallbackQuery, date_=None):
    user = await get_user(callback.from_user.id)
    date = datetime.date.today() if not date_ else datetime.datetime.strptime(date_, "%d.%m.%Y").date()
    prev_date = date - datetime.timedelta(days=1)
    next_date = (date + datetime.timedelta(days=1)) if date != datetime.date.today() else None
    prev_date = {
        "string": prev_date.strftime("%d.%m"),
        "callback": prev_date.strftime("%d.%m.%Y")
    } if prev_date else None
    next_date = {
        "string": next_date.strftime("%d.%m"),
        "callback": next_date.strftime("%d.%m.%Y")
    } if next_date else None
    lessons = [{
        "lesson_id": lesson.id,
        "start_time": lesson.start_time.strftime("%H:%M"),
        "end_time": lesson.end_time.strftime("%H:%M"),
        "listeners": await lesson.aget_listeners(),
        "homeworks": await lesson.homeworks.acount(),
        "status": lesson.status
    } async for lesson in Lesson.objects.filter(
        Q(learningphases__learningplan__teacher=user,
          date=date,
          status__in=[0, 1]) |
        Q(replace_teacher=user,
          date=date,
          status__in=[0, 1])
    )]
    await callback.message.edit_text(f"Вот ваши занятия за {date.strftime('%d.%m.%Y')}\n"
                                     f"В скобках количество ДЗ, крестом отмечены непроведённые\n"
                                     f"К какому занятию прикрепить ДЗ?",
                                     reply_markup=get_homework_lessons_buttons(
                                         lessons, prev_date, next_date)
                                     )


async def add_homework_set_homework_ready(message: types.Message, state: FSMContext):
    statedata = await state.get_data()
    hw_id = statedata.get("new_hw").get("hw_id")
    current_deadline = statedata.get("new_hw").get("deadline")
    current_deadline_dt = datetime.datetime(
        current_deadline.get("year"),
        current_deadline.get("month"),
        current_deadline.get("day"))
    if hw_id:
        hw = await Homework.objects.aget(id=hw_id)
        hw.name = statedata.get("new_hw").get("name")
        hw.description = statedata.get("new_hw").get("description") if statedata.get("new_hw").get("description") \
            else "-"
        hw.deadline = current_deadline_dt
        await hw.asave()
        await hw.materials.aset(statedata.get("new_hw").get("materials"))
        await hw.asave()
        await message.answer("ДЗ успешно изменено")
    else:
        teacher = await get_user(message.from_user.id)
        lesson = await Lesson.objects.aget(pk=statedata.get("new_hw").get("lesson_id"))
        listeners = await lesson.aget_listeners()
        for listener in listeners:
            new_hw = await Homework.objects.acreate(
                name=f'{statedata.get("new_hw").get("name")} ({listener.first_name} {listener.last_name})',
                description=statedata.get("new_hw").get("description") if statedata.get("new_hw").get("description")
                else "-",
                deadline=current_deadline_dt,
                listener_id=listener.id,
                teacher=teacher
            )
            await new_hw.materials.aset(statedata.get("new_hw").get("materials"))
            await new_hw.asave()
            await lesson.homeworks.aadd(new_hw)
            if lesson.status == 1:
                await new_hw.aset_assigned()
                await homework_tg_notificate(teacher,
                                             listener.id,
                                             [new_hw])
                msg_text = f"ДЗ для {listener.first_name} {listener.last_name} успешно задано"
            else:
                msg_text = (f"ДЗ для {listener.first_name} {listener.last_name} успешно создано и будет задано после "
                            f"проведения занятия")
            await message.answer(msg_text)


async def add_homework_set_homework_message(tg_id: int,
                                            state: FSMContext,
                                            lesson_id):
    data = await state.get_data()
    if not data.get("new_hw"):
        last_count = await Homework.objects.acount()
        deadline = datetime.date.today() + datetime.timedelta(days=6)
        await state.update_data({
            "new_hw": {
                "hw_id": None,
                "lesson_id": lesson_id,
                "name": f'Домашнее задание {last_count + 1}',
                "description": None,
                "materials": [],
                "deadline": {
                    'day': deadline.day,
                    'month': deadline.month,
                    'year': deadline.year
                },
            },
            "messages_to_delete": []
        })
        data = await state.get_data()
    keys = get_homework_newhwsetting_buttons(
        name=data.get("new_hw").get("name"),
        description=data.get("new_hw").get("description") if data.get("new_hw").get("description") else "отсутствует",
        deadline=data.get("new_hw").get("deadline"),
        matcount=len(data.get("new_hw").get("materials"))
    )
    await bot.send_message(chat_id=tg_id,
                           text="Для добавления новых материалов просто скиньте их сюда.\n"
                                "При необходимости, отредактируйте параметры ДЗ, с помощью кнопок:",
                           reply_markup=keys)
    await bot.send_message(chat_id=tg_id,
                           text="После завершения настройки ДЗ <b>нажмите кнопку 'Отправить'</b>",
                           reply_markup=message_typing_keyboard)
    for msg in data.get("messages_to_delete"):
        await bot.delete_message(chat_id=tg_id,
                                 message_id=msg)
    await state.update_data({"messages_to_delete": []})
    await state.set_state(HomeworkNewFSM.change_menu)


async def add_homework_set_homework_change(callback: CallbackQuery,
                                           state: FSMContext,
                                           action: str):
    data = await state.get_data()
    if not data.get("new_hw"):
        await bot.send_message(chat_id=callback.from_user.id,
                               text="У вас нет незаданных ДЗ. Пожалуйста, повторите попытку через главное меню")
        await send_menu(callback.from_user.id, state)
        return
    if action == "name":
        await callback.message.delete()
        ask_msg = await bot.send_message(chat_id=callback.from_user.id,
                                         text=f'Текущее наименование ДЗ: {data.get("new_hw").get("name")}\n'
                                              f'Отправьте мне новое наименование или нажмите кнопку "Отмена"',
                                         reply_markup=cancel_keyboard)
        statedata = await state.get_data()
        messages_to_delete = statedata.get("messages_to_delete")
        messages_to_delete.append(ask_msg.message_id)
        await state.update_data({"messages_to_delete": messages_to_delete})
        await state.set_state(HomeworkNewFSM.change_name)
    elif action == "description":
        desc = data.get("new_hw").get("description") if data.get("new_hw").get("description") else "отсутствует"
        await callback.message.delete()
        ask_msg = await bot.send_message(chat_id=callback.from_user.id,
                                         text=f'Текущее описание ДЗ: {desc}\n'
                                              f'Отправьте мне новое описание или нажмите кнопку "Отмена"',
                                         reply_markup=cancel_keyboard)
        statedata = await state.get_data()
        messages_to_delete = statedata.get("messages_to_delete")
        messages_to_delete.append(ask_msg.message_id)
        await state.update_data({"messages_to_delete": messages_to_delete})
        await state.set_state(HomeworkNewFSM.change_description)
    elif action == "deadline":
        await callback.message.delete()
        cur_deadline = data.get("new_hw").get("deadline")
        ask_msg = await bot.send_message(chat_id=callback.from_user.id,
                                         text=f'Текущий срок выполнения ДЗ: '
                                              f'{cur_deadline.get("day")}.{cur_deadline.get("month")}.'
                                              f'{cur_deadline.get("year")}\n'
                                              f'Отправьте мне новый срок выполнения в формате ДД.ММ.ГГГГ или нажмите '
                                              f'кнопку "Отмена"',
                                         reply_markup=cancel_keyboard)
        statedata = await state.get_data()
        messages_to_delete = statedata.get("messages_to_delete")
        messages_to_delete.append(ask_msg.message_id)
        await state.update_data({"messages_to_delete": messages_to_delete})
        await state.set_state(HomeworkNewFSM.change_deadline)
    elif action == "materials":
        await callback.message.delete()
        ask_msg = await bot.send_message(chat_id=callback.from_user.id,
                                         text="Вы действительно хотите удалить <b>из ДЗ</b> все добавленные материалы?",
                                         reply_markup=yes_cancel_keyboard)
        statedata = await state.get_data()
        messages_to_delete = statedata.get("messages_to_delete")
        messages_to_delete.append(ask_msg.message_id)
        await state.update_data({"messages_to_delete": messages_to_delete})
        await state.set_state(HomeworkNewFSM.delete_materials)


async def add_homework_set_homework_change_ready(message: types.Message,
                                                 state: FSMContext,
                                                 action: str):
    def validate_datetime():
        try:
            deadline = datetime.datetime.strptime(message.text, "%d.%m.%Y")
            return {
                'day': deadline.day,
                'month': deadline.month,
                'year': deadline.year,
            }
        except Exception as e:
            return False

    statedata = await state.get_data()
    if action == "name":
        statedata["new_hw"]["name"] = message.text
    elif action == "description":
        statedata["new_hw"]["description"] = message.text
    elif action == "deadline":
        deadline = validate_datetime()
        if deadline:
            statedata["new_hw"]["deadline"] = deadline
        else:
            err_msg = await message.answer("Пожалуйста, укажите дату в формате ДД.ММ.ГГГГ")
            messages_to_delete = statedata.get("messages_to_delete")
            messages_to_delete.append(err_msg.message_id)
            await state.update_data({"messages_to_delete": messages_to_delete})
            return
    elif action == "materials":
        statedata["new_hw"]["materials"] = []
    await state.update_data(statedata)
    await add_homework_set_homework_message(message.from_user.id, state, statedata.get("new_hw").get("listener_id"))


async def show_homework_queryset(tg_id: int, state: FSMContext):
    user = await get_user(tg_id)
    gp = await get_group_and_perms(user.id)
    groups = gp.get('groups')
    if 'Listener' in groups:
        homeworks = list(filter(lambda hw: hw['hw_status'] in [7, 2, 5],
                                [{
                                    'hw': hw,
                                    'hw_status': (await hw.aget_status()).status
                                } async for hw in Homework.objects.filter(listener=user)]))
        homeworks = [hw.get('hw') for hw in homeworks]
        if len(homeworks) == 0:
            await bot.send_message(chat_id=tg_id,
                                   text="Нет домашних заданий для выполнения")
        else:
            await bot.send_message(chat_id=tg_id,
                                   text="Вот домашние задания, которые ждут Вашего выполнения:",
                                   reply_markup=get_homeworks_buttons(homeworks))
    elif 'Teacher' in groups:
        homeworks = list(filter(lambda hw: hw['hw_status'] == 3,
                                [{
                                    'hw': hw,
                                    'hw_status': (await hw.aget_status()).status
                                } async for hw in Homework.objects.filter(teacher=user)]))
        homeworks = [hw.get('hw') for hw in homeworks]
        if len(homeworks) == 0:
            await bot.send_message(chat_id=tg_id,
                                   text="Нет домашних заданий для проверки")
            await send_menu(tg_id, state)
        else:
            await bot.send_message(chat_id=tg_id,
                                   text="Вот домашние задания, которые ждут Вашей проверки:",
                                   reply_markup=get_homeworks_buttons(homeworks, sb=True))
    else:
        await bot.send_message(chat_id=tg_id,
                               text="Для Вашей роли данная функция в Telegram недоступна")


async def search_homeworks_message(callback: CallbackQuery, state: FSMContext):
    await bot.send_message(chat_id=callback.from_user.id,
                           text="Поиск по имени или фамилии:",
                           reply_markup=cancel_keyboard)
    await state.set_state(HomeworkFSM.search)


async def search_homeworks_query(message: types.Message):
    query = message.text.split(" ")
    if len(query) == 0:
        await message.answer("Некорректный запрос")
        return
    listeners = [_ async for _ in NewUser.objects.filter(Q(groups__name="Listener",
                                                           first_name__iregex=f'{query[0]}') |
                                                         Q(groups__name="Listener",
                                                           last_name__iregex=f'{query[0]}'))]
    if len(listeners) == 0:
        await message.answer("По данному запросу не найдено ни одного ученика")
        return
    homeworks = list(filter(lambda hw: hw['hw_status'] == 3,
                            [{
                                'hw': hw,
                                'hw_status': (await hw.aget_status()).status
                            } async for hw in Homework.objects.select_related("listener")
                            .filter(listener__id__in=[usr.id for usr in listeners],
                                    teacher=await get_user(message.from_user.id))]))
    if not homeworks:
        await message.answer("По данному запросу не найдено ни одного домашнего задания")
    msg = "Вот домашние задания, которые требуют Вашей проверки от следующих учеников:"
    for n, hw in enumerate(homeworks):
        msg += f"\n{n+1}. {hw.get('hw').listener.first_name} {hw.get('hw').listener.last_name}"
    await message.answer(text=msg,
                         reply_markup=get_homeworks_buttons([hw.get('hw') for hw in homeworks], sb=False))


async def show_homework(callback: CallbackQuery, callback_data: HomeworkCallback):
    hw = await (Homework.objects.select_related("listener")
                .select_related("teacher")
                .aget(pk=callback_data.hw_id))
    hw_status = await hw.aget_status()
    user = await get_user(callback.from_user.id)
    gp = await get_group_and_perms(user.id)
    can_send = 'Listener' in gp['groups'] and hw_status.status in [7, 2, 5]
    can_check = 'Teacher' in gp['groups'] and hw_status.status in [3]

    await bot.send_message(chat_id=callback.from_user.id,
                           text=f"Домашнее задание: <b>{hw.name}</b>\n"
                                f"Срок выполнения: {hw.deadline}\n"
                                f"Описание: {hw.description}\n",
                           reply_markup=get_homework_item_buttons(hw.id,
                                                                  can_send,
                                                                  can_check))
    for mat in [m.id async for m in hw.materials.all()]:
        await show_material_item(callback, mat)
    if hw_status.status == 7 and 'Listener' in gp.get('groups'):
        await hw.aopen()
    await show_log_item(callback, hw_status.id)


async def show_logs(callback: CallbackQuery, callback_data: HomeworkCallback):
    logs = [{
        'id': log.id,
        'status': status_code_to_string(log.status),
        'dt': log.dt.astimezone().strftime("%d.%m %H:%M"),
    } async for log in HomeworkLog.objects.filter(homework=callback_data.hw_id)]
    await bot.send_message(chat_id=callback.from_user.id,
                           text="История ДЗ:",
                           reply_markup=get_hwlogs_buttons(logs))


async def show_log_item(callback: CallbackQuery, log_id: int):
    log = await HomeworkLog.objects.select_related("user").select_related("homework").aget(pk=log_id)
    files = [_ async for _ in log.files.all()]
    msg = (f"<b>{log.homework.name}</b>\n"
           f"<b>{log.user}: {status_code_to_string(log.status)}</b> - {log.dt.astimezone().strftime('%d.%m %H:%M')}\n\n"
           f"{log.comment}\n")
    await bot.send_message(chat_id=callback.from_user.id,
                           text=msg)
    if len(files) > 0:
        album_builder = MediaGroupBuilder()
        for file in files:
            file_type = get_type(file.path.path.split(".")[-1])
            if file_type == "image_formats":
                if file.tg_url:
                    album_builder.add_photo(media=file.tg_url,
                                            caption=file.caption)
                else:
                    album_builder.add_photo(media=types.FSInputFile(file.path.path),
                                            caption=file.caption)
            if file_type == "video_formats":
                if file.tg_url:
                    album_builder.add_video(media=file.tg_url,
                                            caption=file.caption)
                else:
                    album_builder.add_video(media=types.FSInputFile(file.path.path),
                                            caption=file.caption)
            elif file_type == "audio_formats":
                if file.tg_url:
                    await bot.send_audio(chat_id=callback.from_user.id,
                                         audio=file.tg_url,
                                         caption=file.caption)
                else:
                    await bot.send_audio(chat_id=callback.from_user.id,
                                         audio=types.FSInputFile(file.path.path),
                                         caption=file.caption)
            elif file_type == "voice_formats":
                if file.tg_url:
                    await bot.send_voice(chat_id=callback.from_user.id,
                                         voice=file.tg_url,
                                         caption=file.caption)
                else:
                    await bot.send_voice(chat_id=callback.from_user.id,
                                         voice=types.FSInputFile(file.path.path),
                                         caption=file.caption)
        photos = album_builder.build()
        if photos:
            await bot.send_media_group(chat_id=callback.from_user.id,
                                       media=photos)


async def send_hw_answer(callback: CallbackQuery,
                         callback_data: HomeworkCallback,
                         state: FSMContext):
    hw = await (Homework.objects.select_related("listener")
                .select_related("teacher")
                .aget(pk=callback_data.hw_id))
    hw_status = await hw.aget_status()
    user = await get_user(callback.from_user.id)
    gp = await get_group_and_perms(user.id)
    if 'Listener' in gp['groups'] and hw_status.status in [7, 2, 5]:
        await bot.send_message(chat_id=callback.from_user.id,
                               text="Отправьте мне сообщения, содержащие решение домашнего задания, "
                                    "после чего нажмите кнопку 'Отправить'\nВы можете отправить текст, фотографии, "
                                    "аудио, "
                                    "видео или голосовые сообщения",
                               reply_markup=message_typing_keyboard)
        await state.set_state(HomeworkFSM.send_hw_files)
        await state.update_data({'files': {
            'text': [],
            'photo': [],
            'voice': [],
            'audio': [],
            'video': [],
            'animation': [],
            'document': []
        }, 'action': 'send',
            'hw_id': callback_data.hw_id})
    else:
        await bot.send_message(callback.from_user.id,
                               text="На данный момент Вы не можете отправить решение")


async def send_hw_check(callback: CallbackQuery,
                        callback_data: HomeworkCallback,
                        state: FSMContext):
    hw = await (Homework.objects.select_related("listener")
                .select_related("teacher")
                .aget(pk=callback_data.hw_id))
    hw_status = await hw.aget_status()
    user = await get_user(callback.from_user.id)
    gp = await get_group_and_perms(user.id)
    if 'Teacher' in gp['groups'] and hw_status.status in [3]:
        await bot.send_message(chat_id=callback.from_user.id,
                               text="Отправьте мне сообщения, содержащие проверку домашнего задания, "
                                    "после чего нажмите кнопку 'Отправить'\nВы можете отправить текст, фотографии, аудио, "
                                    "видео или голосовые сообщения",
                               reply_markup=message_typing_keyboard)
        await state.set_state(HomeworkFSM.send_hw_files)
        await state.update_data({'files': {
            'text': [],
            'photo': [],
            'voice': [],
            'audio': [],
            'video': [],
            'animation': [],
            'document': []
        }, 'action': callback_data.action,
            'hw_id': callback_data.hw_id})
    else:
        await bot.send_message(callback.from_user.id,
                               text="На данный момент Вы не можете проверить ДЗ")


async def hw_send(message: types.Message, state: FSMContext):
    data = await state.get_data()
    if not filechecker(data):
        await message.answer("Вы не можете отправить путой ответ. Пожалуйста, пришлите мне текст, фотографии, "
                             "аудио или голосовые сообщения")
        return
    hw = await (Homework.objects.select_related("teacher")
                .select_related("listener").aget(pk=data.get("hw_id")))
    user = await get_user(message.from_user.id)
    hwdata = await filedownloader(data, owner=user)
    status = None
    if data.get('action') == 'send':
        status = 3
    elif data.get('action') == 'check_accept':
        status = 4
    elif data.get('action') == 'check_revision':
        status = 5
    if status:
        hwlog = await HomeworkLog.objects.acreate(homework=hw,
                                                  user=user,
                                                  comment=hwdata.get("comment"),
                                                  status=status)
        await hwlog.files.aset(hwdata.get("files_db"))
        await hwlog.asave()
    if data.get('action') == 'send':
        await message.answer("Решение успешно отправлено\n"
                             "Ожидайте ответа преподавателя")
        teacher_tg = await get_tg_id(hw.teacher)
        if teacher_tg:
            try:
                msg = f"Пришёл новый ответ от ученика по ДЗ <b>'{hw.name}'</b>"
                msg_object = await bot.send_message(chat_id=teacher_tg,
                                                    text=msg,
                                                    reply_markup=get_homeworks_buttons([hw]))
                await TgBotJournal.objects.acreate(
                    recipient=hw.teacher,
                    initiator=hw.listener,
                    event=4,
                    data={
                        "status": "success",
                        "text": msg,
                        "msg_id": msg_object.message_id,
                        "errors": [],
                        "attachments": []
                    }
                )
            except Exception as e:
                await TgBotJournal.objects.acreate(
                    recipient=hw.teacher,
                    initiator=hw.listener,
                    event=4,
                    data={
                        "status": "error",
                        "text": None,
                        "msg_id": None,
                        "errors": [str(e)],
                        "attachments": []
                    }
                )

        else:
            await TgBotJournal.objects.acreate(
                recipient=hw.teacher,
                initiator=hw.listener,
                event=4,
                data={
                    "status": "error",
                    "text": None,
                    "msg_id": None,
                    "errors": ["У пользователя не привязан Telegram"],
                    "attachments": []
                }
            )
    elif data.get('action') in ['check_accept', 'check_revision']:
        await message.answer("Ответ был отправлен")
        listener_tg = await get_tg_id(hw.listener)
        if listener_tg:
            try:
                msg = f"Пришёл новый ответ от преподавателя по ДЗ <b>'{hw.name}'</b>"
                msg_object = await bot.send_message(chat_id=listener_tg,
                                                    text=msg,
                                                    reply_markup=get_homeworks_buttons([hw]))
                await TgBotJournal.objects.acreate(
                    recipient=hw.listener,
                    initiator=hw.teacher,
                    event=4,
                    data={
                        "status": "success",
                        "text": msg,
                        "msg_id": msg_object.message_id,
                        "errors": [],
                        "attachments": []
                    }
                )
            except Exception as e:
                await TgBotJournal.objects.acreate(
                    recipient=hw.listener,
                    initiator=hw.teacher,
                    event=4,
                    data={
                        "status": "error",
                        "text": None,
                        "msg_id": None,
                        "errors": [str(e)],
                        "attachments": []
                    }
                )
    await send_menu(message.from_user.id, state)


async def homework_tg_notificate(initiator: NewUser, listener: int, homeworks: list[Homework]):
    user_tg_note = await Telegram.objects.filter(user_id=listener).afirst()
    if user_tg_note:
        try:
            msg = await bot.send_message(chat_id=user_tg_note.tg_id,
                                         text=f"У вас новые домашние задания!",
                                         reply_markup=get_homeworks_buttons([hw for hw in homeworks]))
            await TgBotJournal.objects.acreate(
                recipient_id=listener,
                initiator=initiator,
                event=3,
                data={
                    "status": "success",
                    "text": "У вас новые домашние задания!",
                    "msg_id": msg.message_id,
                    "errors": [],
                    "attachments": []
                }
            )
        except Exception as e:
            await TgBotJournal.objects.acreate(
                recipient_id=listener,
                initiator=initiator,
                event=3,
                data={
                    "status": "error",
                    "text": None,
                    "msg_id": None,
                    "errors": [str(e)],
                    "attachments": []
                }
            )
    else:
        await TgBotJournal.objects.acreate(
            recipient_id=listener,
            initiator=initiator,
            event=3,
            data={
                "status": "error",
                "text": None,
                "msg_id": None,
                "errors": ["У пользователя не привязан Telegram"],
                "attachments": []
            }
        )
