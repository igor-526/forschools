import datetime
from typing import Type

from aiogram import types
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from django.db.models import Q
from lesson.models import Lesson
from material.models import Material
from tgbot.funcs.fileutils import filechecker, filedownloader
from tgbot.funcs.lessons import get_lesson_can_be_passed
from tgbot.funcs.materials import send_material_item
from tgbot.keyboards.callbacks.homework import HomeworkCallback
from tgbot.keyboards.homework import (get_homework_item_buttons, get_homeworks_buttons,
                                      get_hwlogs_buttons, get_homework_menu_buttons, get_homework_lessons_buttons,
                                      get_homework_editing_buttons)
from tgbot.keyboards.default import cancel_keyboard, message_typing_keyboard
from tgbot.finite_states.homework import HomeworkFSM, HomeworkNewFSM
from tgbot.funcs.menu import send_menu
from tgbot.models import TgBotJournal
from tgbot.utils import get_tg_id, get_tg_note
from profile_management.models import NewUser
from homework.models import Homework, HomeworkLog
from tgbot.create_bot import bot
from tgbot.utils import get_group_and_perms, get_user
from homework.utils import status_code_to_string
from material.utils.get_type import get_type
from aiogram.utils.media_group import MediaGroupBuilder


async def homeworks_send_menu(message: types.Message, state: FSMContext):
    user = await get_user(message.from_user.id)
    perms = await get_group_and_perms(user.id)
    if "Curator" in perms.get("groups"):
        await message.answer(text="Выберите функцию:",
                             reply_markup=get_homework_menu_buttons())
        return
    if "Listener" in perms.get("groups") or "Metodist" in perms.get("groups"):
        await show_homework_queryset(message.from_user.id, state)
    elif "Teacher" in perms.get("groups"):
        await message.answer(text="Выберите функцию:",
                             reply_markup=get_homework_menu_buttons())
    else:
        await message.answer("Функция для Вашей роли недоступна")


async def add_homework_select_lesson(user_tg_id: int, message: types.Message = None,
                                     callback: types.CallbackQuery = None, date_=None):
    user = await get_user(user_tg_id)
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
    if message:
        await message.reply(text=f"К какому занятию прикрепить ДЗ?",
                            reply_markup=get_homework_lessons_buttons(
                                lessons, prev_date, next_date)
                            )
    elif callback:
        await callback.message.edit_text(text=f"К какому занятию прикрепить ДЗ?",
                                         reply_markup=get_homework_lessons_buttons(
                                             lessons, prev_date, next_date)
                                         )


async def add_homework_set_homework_ready(state: FSMContext,
                                          message: types.Message = None,
                                          callback: types.CallbackQuery = None):
    async def notify_hw_changed():
        st = await hw.aget_status()
        if st.status in [2, 3, 5]:
            await homework_tg_notify(hw.teacher,
                                     hw.listener.id,
                                     [hw],
                                     "Домашнее задание было изменено")
        if st.agreement.get("accepted") is not None and not st.agreement.get("accepted"):
            ch_hw_lesson = await hw.aget_lesson()
            ch_hw_plan = await ch_hw_lesson.aget_learning_plan()
            await homework_tg_notify(hw.teacher,
                                     ch_hw_plan.metodist.id,
                                     [hw],
                                     f"Домашнее задание было изменено\n"
                                     f"Преподаватель: {hw.teacher.first_name} {hw.teacher.last_name}\n"
                                     f"Ученик: {hw.listener.first_name} {hw.listener.last_name}")

    statedata = await state.get_data()
    hw_id = statedata.get("new_hw").get("hw_id")
    current_deadline = statedata.get("new_hw").get("deadline")
    current_deadline_dt = datetime.datetime(
        current_deadline.get("year"),
        current_deadline.get("month"),
        current_deadline.get("day"))
    if hw_id:
        hw = await Homework.objects.select_related("teacher").select_related("listener").aget(id=hw_id)
        hw.name = statedata.get("new_hw").get("name")
        hw.description = statedata.get("new_hw").get("description") if statedata.get("new_hw").get("description") \
            else "-"
        hw.deadline = current_deadline_dt
        await hw.asave()
        await hw.materials.aset(statedata.get("new_hw").get("materials"))
        await hw.asave()
        await message.answer("ДЗ успешно изменено")
        await notify_hw_changed()
        await send_menu(message.from_user.id, state)
    else:
        teacher = await get_user(callback.from_user.id)
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
                result = await new_hw.aset_assigned()
                if result.get("agreement"):
                    msg_text = (f"ДЗ для {listener.first_name} {listener.last_name} будет задано после проверки "
                                f"методистом")
                    lesson = await new_hw.aget_lesson()
                    plan = await lesson.aget_learning_plan()
                    await homework_tg_notify(teacher,
                                             plan.metodist.id,
                                             [new_hw],
                                             "Требуется согласование действия преподавателя")
                else:
                    msg_text = f"ДЗ для {listener.first_name} {listener.last_name} успешно задано"
                    await homework_tg_notify(teacher,
                                             listener.id,
                                             [new_hw])
            elif lesson.status == 0 and get_lesson_can_be_passed(lesson):
                result = await new_hw.aset_assigned()
                if result.get("agreement"):
                    msg_text = (f"ДЗ для {listener.first_name} {listener.last_name} будет задано после проверки "
                                f"методистом")
                    lesson = await new_hw.aget_lesson()
                    plan = await lesson.aget_learning_plan()
                    await homework_tg_notify(teacher,
                                             plan.metodist.id,
                                             [new_hw],
                                             "Требуется согласование действия преподавателя")
                else:
                    msg_text = (f"ДЗ для {listener.first_name} {listener.last_name} успешно задано\n"
                                f"Занятие будет считаться проведённым")
                    await homework_tg_notify(teacher,
                                             listener.id,
                                             [new_hw])
                    await lesson.aset_passed()
            else:
                msg_text = (f"ДЗ для {listener.first_name} {listener.last_name} успешно создано и будет задано после "
                            f"проведения занятия")
            if message:
                await message.reply(msg_text)
                await send_menu(message.from_user.id, state)
            if callback:
                await callback.message.edit_text(msg_text)
                await send_menu(callback.from_user.id, state)


async def add_homework_set_homework_message(tg_id: int,
                                            state: FSMContext):
    data = await state.get_data()
    if not data.get("new_hw"):
        last_count = await Homework.objects.acount()
        deadline = datetime.date.today() + datetime.timedelta(days=6)
        await state.update_data({
            "new_hw": {
                "hw_id": None,
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
    await bot.send_message(chat_id=tg_id,
                           text="Перешлите сюда или прикрепите материал, или напишите сообщение\n"
                                "Когда будет готово, нажмите кнопку <b>'Подтвердить ДЗ'</b>",
                           reply_markup=get_homework_editing_buttons())
    await state.update_data({"messages_to_delete": []})
    await state.set_state(HomeworkNewFSM.change_menu)


async def show_homework_queryset(tg_id: int, state: FSMContext):
    user = await get_user(tg_id)
    gp = await get_group_and_perms(user.id)
    groups = gp.get('groups')
    if 'Metodist' in groups:
        homeworks = list(filter(lambda hw: hw['hw_status'] is not None and not hw['hw_status'],
                                [{
                                    'obj': hw,
                                    'hw_status': (await hw.aget_status()).agreement.get("accepted")
                                } async for hw in Homework.objects.filter(
                                    lesson__learningphases__learningplan__metodist=user)]))
        homeworks = [{
            'name': hw.get("obj").name,
            'status': False,
            'id': hw.get("obj").id
        } for hw in homeworks]
        if len(homeworks) == 0:
            await bot.send_message(chat_id=tg_id,
                                   text="Нет домашних заданий для проверки")
            await send_menu(tg_id, state)
        else:
            await bot.send_message(chat_id=tg_id,
                                   text="Вот домашние задания, действия преподавателей которых ждут Вашей проверки:",
                                   reply_markup=get_homeworks_buttons(homeworks, sb=True))
    elif 'Teacher' in groups:
        homeworks = list(filter(lambda hw: hw['hw_status'].status in [3, 5] and
                                           (hw['hw_status'].agreement.get("accepted") is None or
                                            hw['hw_status'].agreement.get("accepted") == True),
                                [{
                                    'obj': hw,
                                    'hw_status': await hw.aget_status()
                                } async for hw in Homework.objects.filter(teacher=user)]))
        homeworks = [{
            'name': hw.get("obj").name,
            'status': hw.get("hw_status") == 5,
            'id': hw.get("obj").id
        } for hw in homeworks]
        if len(homeworks) == 0:
            await bot.send_message(chat_id=tg_id,
                                   text="Нет домашних заданий для проверки")
            await send_menu(tg_id, state)
        else:
            await bot.send_message(chat_id=tg_id,
                                   text="Вот домашние задания, которые ждут Вашей проверки:",
                                   reply_markup=get_homeworks_buttons(homeworks, sb=True))
    elif 'Listener' in groups:
        homeworks = list(filter(lambda hw: hw['hw_status'] in [7, 2, 3, 5],
                                [{
                                    'obj': hw,
                                    'hw_status': (await hw.aget_status()).status
                                } async for hw in Homework.objects.filter(listener=user)]))
        homeworks = [{
            'name': hw.get("obj").name,
            'status': hw.get("hw_status") == 3,
            'id': hw.get("obj").id
        } for hw in homeworks]
        if len(homeworks) == 0:
            await bot.send_message(chat_id=tg_id,
                                   text="Нет домашних заданий для выполнения")
        else:
            await bot.send_message(chat_id=tg_id,
                                   text="Вот домашние задания, которые ждут Вашего выполнения:",
                                   reply_markup=get_homeworks_buttons(homeworks))
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
        msg += f"\n{n + 1}. {hw.get('hw').listener.first_name} {hw.get('hw').listener.last_name}"
    await message.answer(text=msg,
                         reply_markup=get_homeworks_buttons([hw.get('hw') for hw in homeworks], sb=False))


async def show_homework(callback: CallbackQuery,
                        callback_data: HomeworkCallback | Type[HomeworkCallback],
                        state: FSMContext,
                        materials_button: bool = True,
                        show_last_logs: bool = True):

    async def get_history_button() -> bool:
        logs_status = [3, 4, 5] if 'Listener' in gp['groups'] else [1, 2, 3, 4, 5, 6, 7]
        l = await HomeworkLog.objects.filter(homework=callback_data.hw_id,
                                             status__in=logs_status).aexists()
        return l

    async def send_materials_and_get_reply_markup():
        if not materials_button:
            rm = get_homework_item_buttons(hw.id,
                                           can_send,
                                           can_check,
                                           0,
                                           await get_history_button())
            return rm
        if tg_note.setting_show_hw_materials:
            await send_hw_materials([mat.id async for mat in hw.materials.all()], hw.id, callback.from_user.id,
                                    callback, state,
                                    False if 'Listener' in gp.get('groups') else True, False)
            rm = get_homework_item_buttons(hw.id,
                                           can_send,
                                           can_check,
                                           0,
                                           await get_history_button(),
                                           can_agreement_logs)
        else:
            rm = get_homework_item_buttons(hw.id,
                                           can_send,
                                           can_check,
                                           await hw.materials.acount(),
                                           await get_history_button(),
                                           can_agreement_logs)
        return rm

    async def send_last_log():
        logs = [{
            "id": log.id,
            "status": log.status
        } async for log in hw.log.all()]
        logs_to_show = []
        for log in logs:
            if not logs_to_show:
                logs_to_show.append(log)
            else:
                if log['status'] == logs_to_show[-1]['status']:
                    logs_to_show.append(log)
                else:
                    break
        for log in list(reversed(logs_to_show)):
            await show_log_item(callback, log['id'])

    tg_note = await get_tg_note(callback.from_user.id)
    hw = await (Homework.objects.select_related("listener")
                .select_related("teacher")
                .aget(pk=callback_data.hw_id))
    hw_status = await hw.aget_status()
    user = await get_user(callback.from_user.id)
    gp = await get_group_and_perms(user.id)
    can_send = 'Listener' in gp['groups'] and hw_status.status in [2, 3, 5, 7]
    can_check = (('Teacher' in gp['groups'] and hw_status.status in [3, 5]) or
                 ('Metodist' in gp['groups'] and hw_status.status in [3, 5]))
    lesson = await hw.aget_lesson()
    lp = None
    if lesson:
        lp = await lesson.aget_learning_plan()
    can_agreement_logs = lp and lp.metodist and lp.metodist == user
    reply_markup = await send_materials_and_get_reply_markup()
    if hw_status.status == 7 and 'Listener' in gp.get('groups'):
        await hw.aopen()
    if show_last_logs:
        await send_last_log()
    msgtext = f"ДЗ <b>{hw.name}</b>\n"
    if hw.description:
        msgtext += f"{hw.description}\n"
    msgtext += "Выберите действие:"
    await bot.send_message(chat_id=callback.from_user.id,
                           text=msgtext,
                           reply_markup=reply_markup)


async def send_hw_materials(mat_ids: list, hw_id: int | None, user_id: int, callback: CallbackQuery | None,
                            state: FSMContext, meta: bool, del_hw_msg=True):
    if hw_id is None:
        await state.update_data({"mat_show_action": "hw",
                                 "mat_show_hw_id": hw_id})
    else:
        usr = await get_user(user_id)
        hw = await Homework.objects.select_related("teacher").aget(id=hw_id)
        hw_lesson = await hw.aget_lesson()
        lp = await hw_lesson.aget_learning_plan() if hw_lesson else None
        if hw.teacher == usr or (lp and lp.metodist == usr) or await lp.curators.filter(pk=usr.id).aexists():
            await state.update_data({"mat_show_action": "hw",
                                     "mat_show_hw_id": hw_id})
    for mat in mat_ids:
        await send_material_item(user_id, state, await Material.objects.aget(pk=mat), meta=meta)
    if del_hw_msg and callback:
        hw_callback = HomeworkCallback
        hw_callback.hw_id = hw_id
        await show_homework(callback, hw_callback, state, False)
        await callback.message.delete()


async def show_logs(callback: CallbackQuery, callback_data: HomeworkCallback):
    user = await get_user(callback.from_user.id)
    is_listener = await user.groups.filter(name="Listener").aexists()
    logs_status = [3, 4, 5] if is_listener else [1, 2, 3, 4, 5, 6, 7]
    dt_info = False if is_listener else True
    logs = [{
        'id': log.id,
        'status': status_code_to_string(log.status),
        'dt': log.dt.astimezone().strftime("%d.%m %H:%M"),
    } async for log in HomeworkLog.objects.filter(homework=callback_data.hw_id,
                                                  status__in=logs_status)]
    if logs:
        await bot.send_message(chat_id=callback.from_user.id,
                               text="История ДЗ:",
                               reply_markup=get_hwlogs_buttons(logs, dt_info))
    else:
        await bot.send_message(chat_id=callback.from_user.id,
                               text="События отсутствуют")


async def show_log_item(callback: CallbackQuery, log_id: int):
    log = await HomeworkLog.objects.select_related("user").select_related("homework").aget(pk=log_id)
    files = [_ async for _ in log.files.all()]
    comment = log.comment.replace('<br>', '\n') if log.comment else '-'
    lesson = await log.homework.aget_lesson()
    if lesson:
        msg = f"<b>{log.homework.name}</b> к занятию '<b>{lesson.name}</b>'\n"
    else:
        msg = f"<b>{log.homework.name}</b>\n"
    msg += (f"<b>{log.user}: {status_code_to_string(log.status)}</b> - {log.dt.astimezone().strftime('%d.%m %H:%M')}\n\n"
            f"{comment}\n")
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
    if 'Listener' in gp['groups'] and hw_status.status in [7, 2, 3, 5]:
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
    if 'Teacher' in gp['groups'] and hw_status.status in [3, 5]:
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
    async def get_hwlog_object(agreement=False):
        if agreement:
            hw_log = await HomeworkLog.objects.acreate(homework=hw,
                                                       user=user,
                                                       comment=hwdata.get("comment"),
                                                       status=status,
                                                       agreement={
                                                           "accepted_dt": None,
                                                           "accepted": False
                                                       })
        else:
            hw_log = await HomeworkLog.objects.acreate(homework=hw,
                                                       user=user,
                                                       comment=hwdata.get("comment"),
                                                       status=status
                                                       )
        await hw_log.files.aset(hwdata.get("files_db"))
        await hw_log.asave()
        return hw_log

    async def notify_teacher():
        teacher_tg = await get_tg_id(hw.teacher.id, "main")
        if teacher_tg:
            try:
                msg = f"Пришёл новый ответ от ученика по ДЗ <b>'{hw.name}'</b>"
                msg_object = await bot.send_message(chat_id=teacher_tg,
                                                    text=msg,
                                                    reply_markup=get_homeworks_buttons([{
                                                        'name': hw.name,
                                                        'id': hw.id
                                                    }]))
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

    async def notify_listener():
        listener_tgs = await get_tg_id(hw.listener.id)
        for listener_tg in listener_tgs:
            try:
                msg = f"Пришёл новый ответ от преподавателя по ДЗ <b>'{hw.name}'</b>"
                msg_object = await bot.send_message(chat_id=listener_tg.get("tg_id"),
                                                    text=msg,
                                                    reply_markup=get_homeworks_buttons([{
                                                        'name': hw.name,
                                                        'id': hw.id
                                                    }]))
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

    async def notify_metodist():
        metodist_tg = await get_tg_id(lp.metodist.id, "main")
        if metodist_tg:
            try:
                msg = f"Требуется проверка действия преподавателя"
                msg_object = await bot.send_message(chat_id=metodist_tg,
                                                    text=msg,
                                                    reply_markup=get_homeworks_buttons([{
                                                        'name': hw.name,
                                                        'id': hw.id
                                                    }]))
                await TgBotJournal.objects.acreate(
                    recipient=lp.metodist,
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
                    recipient=lp.metodist,
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

        else:
            await TgBotJournal.objects.acreate(
                recipient=lp.metodist,
                initiator=hw.teacher,
                event=4,
                data={
                    "status": "error",
                    "text": None,
                    "msg_id": None,
                    "errors": ["У пользователя не привязан Telegram"],
                    "attachments": []
                }
            )

    data = await state.get_data()
    if not filechecker(data):
        await message.answer("Вы не можете отправить путой ответ. Пожалуйста, пришлите мне текст, фотографии, "
                             "аудио или голосовые сообщения")
        return
    hw = await (Homework.objects.select_related("teacher")
                .select_related("listener").aget(pk=data.get("hw_id")))
    user = await get_user(message.from_user.id)
    hwdata = await filedownloader(data, owner=user, t="ДЗ", error_reply=message)
    status = None
    if data.get('action') == 'send':
        status = 3
        await message.answer("Решение успешно отправлено\n"
                             "Ожидайте ответа преподавателя")
        await get_hwlog_object(False)
        await notify_teacher()
    if data.get('action') in ['check_accept', 'check_revision']:
        lesson = await hw.aget_lesson()
        lp = None
        if lesson:
            lp = await lesson.aget_learning_plan()
        if data.get('action') == 'check_accept':
            status = 4
        elif data.get('action') == 'check_revision':
            status = 5
        if lp and lp.metodist:
            await get_hwlog_object(True)
            await message.answer("Ответ отправлен на согласование методисту")
            await notify_metodist()
        else:
            await get_hwlog_object(False)
            await message.answer("Ответ был отправлен ученику")
            await notify_listener()
    await send_menu(message.from_user.id, state)


async def homework_tg_notify(initiator: NewUser, listener: int,
                             homeworks: list[Homework], text="У вас новые домашние задания!"):
    listener_tgs = await get_tg_id(listener)
    for user_tg_note in listener_tgs:
        try:
            msg = await bot.send_message(chat_id=user_tg_note.get("tg_id"),
                                         text=text,
                                         reply_markup=get_homeworks_buttons([{
                                             "name": hw.name,
                                             "id": hw.id
                                         } for hw in homeworks]))
            await TgBotJournal.objects.acreate(
                recipient_id=listener,
                initiator=initiator,
                event=3,
                data={
                    "status": "success",
                    "text": text,
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
    if not listener_tgs:
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
