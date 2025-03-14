import datetime
from aiogram import types
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from django.db.models import Q
from lesson.models import Lesson
from material.models import Material
from tgbot.funcs.lessons import get_lesson_can_be_passed
from tgbot.keyboards.callbacks.homework import HomeworkCallback, HomeworkCuratorCallback
from tgbot.keyboards.homework import (get_homeworks_buttons, get_homework_menu_buttons,
                                      get_homework_lessons_buttons, get_homework_editing_buttons,
                                      get_homework_curator_button, get_homework_add_ready_buttons)
from tgbot.keyboards.default import cancel_keyboard, homework_typing_keyboard
from tgbot.finite_states.homework import HomeworkFSM, HomeworkNewFSM
from tgbot.funcs.menu import send_menu
from tgbot.models import TgBotJournal
from tgbot.utils import get_tg_id
from profile_management.models import NewUser
from homework.models import Homework, HomeworkLog, HomeworkGroups
from tgbot.create_bot import bot
from tgbot.utils import get_group_and_perms, get_user
from material.utils.get_type import get_type
from user_logs.models import UserLog
from user_logs.serializers import get_role_ru
from user_logs.utils import aget_role_from_plan


async def homeworks_send_menu(message: types.Message, state: FSMContext):
    user = await get_user(message.from_user.id)
    perms = await get_group_and_perms(user.id)
    func_params = {
        "new_hw_btn": False,
        "check_hw_btn": False,
        "compl_hw_btn": False,
        "sended_hw_btn": False,
    }
    open_as = []
    if len(perms.get("groups")) > 1:
        for role in perms.get("groups"):
            open_as.append({
                "name": role,
                "name_ru": get_role_ru(role, "n", True)
            })
    if "Curator" in perms.get("groups"):
        func_params["new_hw_btn"] = True
        func_params["check_hw_btn"] = True
    if "Listener" in perms.get("groups"):
        func_params["compl_hw_btn"] = True
    if "Metodist" in perms.get("groups"):
        func_params["new_hw_btn"] = True
        func_params["check_hw_btn"] = True
    if "Teacher" in perms.get("groups"):
        func_params["new_hw_btn"] = True
        func_params["check_hw_btn"] = True
        func_params["sended_hw_btn"] = True
    await message.answer(text="Выберите функцию:",
                         reply_markup=get_homework_menu_buttons(func_params, open_as))


async def add_homework_select_lesson(user_tg_id: int, message: types.Message = None,
                                     callback: types.CallbackQuery = None, date_=None):
    async def get_lessons():
        groups = [g.name async for g in user.groups.all()]
        l = []
        if "Teacher" in groups:
            l += [{
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
        elif "Metodist" in groups:
            l += [{
                "lesson_id": lesson.id,
                "start_time": lesson.start_time.strftime("%H:%M"),
                "end_time": lesson.end_time.strftime("%H:%M"),
                "listeners": await lesson.aget_listeners(),
                "homeworks": await lesson.homeworks.acount(),
                "status": lesson.status
            } async for lesson in Lesson.objects.filter(
                learningphases__learningplan__metodist=user,
                date=date,
                status__in=[0, 1]
            )]
        if "Curator" in groups:
            l += [{
                "lesson_id": lesson.id,
                "start_time": lesson.start_time.strftime("%H:%M"),
                "end_time": lesson.end_time.strftime("%H:%M"),
                "listeners": await lesson.aget_listeners(),
                "homeworks": await lesson.homeworks.acount(),
                "status": lesson.status
            } async for lesson in Lesson.objects.filter(
                learningphases__learningplan__curators=user,
                date=date,
                status__in=[1]
            )]
        return l

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
    lessons = await get_lessons()
    if message:
        await message.reply(text=f"К какому занятию прикрепить ДЗ?",
                            reply_markup=get_homework_lessons_buttons(
                                lessons,
                                prev_date,
                                date.strftime("%d.%m.%Y"),
                                next_date)
                            )
    elif callback:
        await callback.message.edit_text(text=f"К какому занятию прикрепить ДЗ?",
                                         reply_markup=get_homework_lessons_buttons(
                                             lessons,
                                             prev_date,
                                             date.strftime("%d.%m.%Y"),
                                             next_date)
                                         )


async def add_homework_set_homework_ready(state: FSMContext,
                                          message: types.Message = None,
                                          callback: types.CallbackQuery = None):
    async def new_hw_result():
        is_curator = user.id in curators_ids
        is_methodist = methodist == user
        is_teacher = user in [teacher, lesson.replace_teacher]
        lesson_can_be_passed = get_lesson_can_be_passed(lesson) if lesson else False
        rm = None
        msg_text = "!"
        if lesson.status == 3:
            msg_text = "Вы не можете задать ДЗ к этому занятию, так как оно отменено"
        elif is_teacher:
            if lesson.status == 1 and methodist:
                msg_text = f"ДЗ для {listener.first_name} {listener.last_name} отправлено на согласование"
                await hw.aset_assigned()
                rm = get_homework_add_ready_buttons(hw_id=hw.id,
                                                    lesson_id=None,
                                                    for_curator_status=True if curators_ids else None)
                await homework_tg_notify(user,
                                         methodist.id,
                                         [hw],
                                         f"Преподаватель задал ДЗ. Требуется согласование", 8)
            elif lesson.status == 1 and methodist is None:
                msg_text = f"ДЗ для {listener.first_name} {listener.last_name} задано"
                await hw.aset_assigned()
                rm = get_homework_add_ready_buttons(hw_id=hw.id,
                                                    lesson_id=None,
                                                    for_curator_status=True if curators_ids else None)
                await homework_tg_notify(user,
                                         listener.id,
                                         [hw],
                                         "У вас новое домашнее задание!")
                for cur_id in curators_ids:
                    await homework_tg_notify(user,
                                             cur_id,
                                             [hw],
                                             "Преподаватель задал новое ДЗ")
            elif lesson.status == 0 and lesson_can_be_passed and methodist:
                msg_text = (f"ДЗ для {listener.first_name} {listener.last_name} сохранено и будет отправлено на "
                            f"согласование методисту после заполнения формы занятия")
                rm = get_homework_add_ready_buttons(hw_id=hw.id,
                                                    lesson_id=lesson.id,
                                                    for_curator_status=True if curators_ids else None)
            elif lesson.status == 0 and lesson_can_be_passed and methodist is None:
                msg_text = (f"ДЗ для {listener.first_name} {listener.last_name} сохранено и будет задано после "
                            f"заполнения формы занятия")
                rm = get_homework_add_ready_buttons(hw_id=hw.id,
                                                    lesson_id=lesson.id,
                                                    for_curator_status=True if curators_ids else None)
            elif lesson.status == 0 and not lesson_can_be_passed:
                msg_text = (f"ДЗ для {listener.first_name} {listener.last_name} сохранено и будет задано после "
                            f"проведения занятия")
                rm = get_homework_add_ready_buttons(hw_id=hw.id,
                                                    lesson_id=None,
                                                    for_curator_status=True if curators_ids else None)
        elif is_curator:
            if lesson.status == 1 and methodist:
                msg_text = f"ДЗ для {listener.first_name} {listener.last_name} отправлено на согласование"
                await hw.aset_assigned()
                rm = get_homework_add_ready_buttons(hw_id=hw.id,
                                                    lesson_id=None,
                                                    for_curator_status=None)
                await homework_tg_notify(user,
                                         methodist.id,
                                         [hw],
                                         f"Куратор задал ДЗ. Требуется согласование", 8)
            elif lesson.status == 1 and methodist is None:
                msg_text = f"ДЗ для {listener.first_name} {listener.last_name} задано"
                await hw.aset_assigned()
                rm = get_homework_add_ready_buttons(hw_id=hw.id,
                                                    lesson_id=None,
                                                    for_curator_status=True if curators_ids else None)
                await homework_tg_notify(user,
                                         listener.id,
                                         [hw],
                                         "У вас новое домашнее задание!")
                await homework_tg_notify(user,
                                         teacher.id,
                                         [hw],
                                         "Куратор задал новое ДЗ")
            elif lesson.status == 0:
                msg_text = (
                    f"ДЗ для {listener.first_name} {listener.last_name} не может быть задано, так как занятие не"
                    f" проведено. ДЗ удалено")
                await hw.adelete()
        elif is_methodist:
            if lesson.status == 1:
                msg_text = f"ДЗ для {listener.first_name} {listener.last_name} задано"
                await hw.aset_assigned()
                rm = get_homework_add_ready_buttons(hw_id=hw.id,
                                                    lesson_id=None,
                                                    for_curator_status=True if curators_ids else None)
                await homework_tg_notify(user,
                                         listener.id,
                                         [hw],
                                         "У вас новое домашнее задание!")
                for cur_id in curators_ids:
                    await homework_tg_notify(user,
                                             cur_id,
                                             [hw],
                                             "Методист задал новое ДЗ")
            elif lesson.status == 0:
                msg_text = (f"ДЗ для {listener.first_name} {listener.last_name} создано и будет задано после "
                            f"проведения занятия")
                rm = get_homework_add_ready_buttons(hw_id=hw.id,
                                                    lesson_id=None,
                                                    for_curator_status=True if curators_ids else None)
        else:
            msg_text = "Вы не можете задать ДЗ к этому занятию"
        if message:
            await message.answer(text=msg_text,
                                 reply_markup=rm)
            await send_menu(message.from_user.id, state)
        if callback:
            await bot.send_message(chat_id=callback.from_user.id,
                                   text=msg_text,
                                   reply_markup=rm)
            await send_menu(callback.from_user.id, state)

    async def notify_hw_changed():
        st = await hw.aget_status(False)
        if st.status in [2, 3, 5] and st.agreement.get("accepted") in [True, None]:
            await homework_tg_notify(user,
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
            await homework_tg_notify(user,
                                     hw.teacher.id,
                                     [hw],
                                     f"Домашнее задание было изменено\n")

    async def log_add_materials(old_mat=None, new_mat=None):
        if new_mat is None:
            new_mat = []
        if old_mat is None:
            old_mat = []
        added_materials = list(filter(lambda mat_id: mat_id not in old_mat, new_mat))
        if added_materials:
            plan = await lesson.aget_learning_plan() if lesson else None
            files = [{
                "type": get_type(f.file.name.split('.')[-1]),
                "href": f.file.url
            } async for f in Material.objects.filter(id__in=added_materials)]
            user_role_ru = get_role_ru(await aget_role_from_plan(plan, user))
            await UserLog.objects.acreate(log_type=4,
                                          learning_plan=plan,
                                          title=f'{user_role_ru} добавил в ДЗ новые материалы',
                                          content={
                                              "list": [
                                                  {
                                                      "name": "Наименование ДЗ",
                                                      "val": hw.name
                                                  },
                                                  {
                                                      "name": "Наименование занятия",
                                                      "val": lesson.name
                                                  },
                                                  {
                                                      "name": "Дата занятия",
                                                      "val": lesson.date.strftime("%d.%m.%Y")
                                                  },
                                              ],
                                              "text": [],
                                          },
                                          buttons=[{"inner": "Занятие",
                                                    "href": f"/lessons/{lesson.id}"},
                                                   {"inner": "ДЗ",
                                                    "href": f"/homeworks/{hw.id}"}
                                                   ],
                                          files=files,
                                          user=user)

    statedata = await state.get_data()
    hw_id = statedata.get("new_hw").get("hw_id")
    current_deadline = statedata.get("new_hw").get("deadline")

    user = await get_user(callback.from_user.id) if callback else await get_user(message.from_user.id)
    current_deadline_dt = datetime.datetime(
        current_deadline.get("year"),
        current_deadline.get("month"),
        current_deadline.get("day")) if current_deadline else None
    if hw_id:
        homework = await Homework.objects.select_related("teacher").select_related("listener").aget(id=hw_id)
        hw_group = await homework.homeworkgroups_set.afirst()
        if hw_group:
            hws = [_ async for _ in hw_group.homeworks.select_related("teacher").select_related("listener").all()]
        else:
            hws = [homework]

        for hw in hws:
            hw.name = statedata.get("new_hw").get("name")
            hw.description = statedata.get("new_hw").get("description") if statedata.get("new_hw").get("description") \
                else "-"
            hw.deadline = current_deadline_dt
            await hw.asave()
            old_materials = [mat.id async for mat in hw.materials.all()]
            await hw.materials.aset(statedata.get("new_hw").get("materials"))
            await hw.asave()
            lesson = await hw.aget_lesson()
            await log_add_materials(old_materials, statedata.get("new_hw").get("materials"))
            await notify_hw_changed()
        await message.answer(text="ДЗ успешно изменено",
                             reply_markup=None)
        await send_menu(message.from_user.id, state)
    else:
        lesson = await Lesson.objects.select_related("replace_teacher").aget(pk=statedata.get("new_hw").get("lesson_id"))
        listeners = await lesson.aget_listeners()
        plan = await lesson.aget_learning_plan() if lesson else None
        teacher = plan.default_hw_teacher if plan else user
        methodist = plan.metodist if plan else None
        curators_ids = [u.id async for u in plan.curators.all()] if plan else []
        homeworks = []
        for listener in listeners:
            hw = await Homework.objects.acreate(
                name=f'{statedata.get("new_hw").get("name")}',
                description=statedata.get("new_hw").get("description") if statedata.get("new_hw").get("description")
                else "-",
                deadline=current_deadline_dt,
                listener_id=listener.id,
                teacher=user,
                for_curator=True
            )
            hw = await Homework.objects.select_related("teacher").select_related("listener").aget(pk=hw.id)
            await hw.materials.aset(statedata.get("new_hw").get("materials"))
            if lesson:
                await lesson.homeworks.aadd(hw)
            await new_hw_result()
            homeworks.append(hw)
        if len(homeworks) > 1:
            hw_group = await HomeworkGroups.objects.acreate()
            await hw_group.homeworks.aset(homeworks)
    if callback:
        await callback.message.delete()


async def add_homework_set_homework_message(tg_id: int,
                                            state: FSMContext):
    data = await state.get_data()
    if not data.get("new_hw"):
        last_count = await Homework.objects.acount()
        deadline = datetime.date.today() + datetime.timedelta(days=6)
        await state.update_data({
            "new_hw": {
                "hw_id": None,
                "name": f'ДЗ {last_count + 1}',
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


async def show_homework_queryset(tg_id: int, state: FSMContext, func: str):
    user = await get_user(tg_id)
    gp = await get_group_and_perms(user.id)
    groups = gp.get('groups')
    if func == "complete":
        if 'Listener' in groups:
            homeworks = list(filter(lambda hw: hw['hw_status'] in [7, 2, 3, 5],
                                    [{
                                        'obj': hw,
                                        'hw_status': (await hw.aget_status(True)).status,
                                        'name': await hw.aget_tg_name(groups)
                                    } async for hw in Homework.objects.filter(listener=user)]))
            homeworks = [{
                'name': hw.get("name"),
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
    elif func == "check":
        methodist_homeworks = []
        teacher_homeworks = []
        curator_homeworks = []
        if 'Metodist' in groups:
            homeworks = list(filter(lambda hw: hw['hw_status'] is not None and not hw['hw_status'],
                                    [{
                                        'obj': hw,
                                        'hw_status': (await hw.aget_status()).agreement.get("accepted"),
                                        'name': await hw.aget_tg_name(groups)
                                    } async for hw in Homework.objects.select_related("listener").filter(
                                        lesson__learningphases__learningplan__metodist=user)]))
            methodist_homeworks = [{
                'name': hw.get("name"),
                'status': False,
                'id': hw.get("obj").id
            } for hw in homeworks]
        if 'Teacher' in groups:
            homeworks = list(filter(lambda hw: hw['hw_status'].status in [3, 5] and
                                               (hw['hw_status'].agreement.get("accepted") is None or
                                                hw['hw_status'].agreement.get("accepted")),
                                    [{
                                        'obj': hw,
                                        'hw_status': await hw.aget_status(),
                                        'name': await hw.aget_tg_name(groups)
                                    } async for hw in Homework.objects.select_related("listener")
                                    .filter(teacher=user)]))
            teacher_homeworks = [{
                'name': hw.get("name"),
                'status': hw.get("hw_status") == 5,
                'id': hw.get("obj").id
            } for hw in homeworks]
        if 'Curator' in groups:
            homeworks = list(filter(lambda hw: hw['hw_status'].status in [3, 5],
                                    [{
                                        'obj': hw,
                                        'hw_status': await hw.aget_status(),
                                        'name': await hw.aget_tg_name(groups)
                                    } async for hw in Homework.objects.select_related("listener").filter(
                                        lesson__learningphases__learningplan__curators=user)]))
            curator_homeworks = [{
                'name': hw.get("name"),
                'status': hw.get("hw_status") == 5,
                'id': hw.get("obj").id
            } for hw in homeworks]
        if len([*methodist_homeworks, *teacher_homeworks, *curator_homeworks]) == 0:
            await bot.send_message(chat_id=tg_id,
                                   text="Нет домашних заданий для проверки")
            await send_menu(tg_id, state)
        else:
            await bot.send_message(chat_id=tg_id,
                                   text="Вот домашние задания, которые ждут Вашей проверки:",
                                   reply_markup=get_homeworks_buttons(
                                       [*methodist_homeworks, *teacher_homeworks, *curator_homeworks],
                                       sb=True))
    elif func == "sended":
        homeworks = list(filter(lambda hw: hw['hw_status'] in [1, 2, 5, 7],
                                [{
                                    'obj': hw,
                                    'hw_status': (await hw.aget_status()).status,
                                    'name': await hw.aget_tg_name(groups)
                                } async for hw in Homework.objects.select_related("listener").filter(teacher=user)]))
        homeworks = [{
            'name': hw.get("name"),
            'status': hw.get("hw_status") == 3,
            'id': hw.get("obj").id
        } for hw in homeworks]
        if len(homeworks) == 0:
            await bot.send_message(chat_id=tg_id,
                                   text="Нет отправленных ДЗ, на которые не ответил ученик")
        else:
            await bot.send_message(chat_id=tg_id,
                                   text="Вот домашние задания, которые были отправлены и на которые не ответил ученик:",
                                   reply_markup=get_homeworks_buttons(homeworks))


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
                                    "аудио, видео или голосовые сообщения",
                               reply_markup=homework_typing_keyboard)
        await state.set_state(HomeworkFSM.send_hw_files)
        await state.update_data({'files': [],
                                 'comment': [],
                                 'action': 'send',
                                 'hw_id': callback_data.hw_id})
    else:
        await bot.send_message(callback.from_user.id,
                               text="На данный момент Вы не можете отправить решение")


async def send_hw_check(callback: CallbackQuery,
                        callback_data: HomeworkCallback,
                        state: FSMContext):
    async def get_access():
        hw = await (Homework.objects.select_related("listener")
                    .select_related("teacher")
                    .aget(pk=callback_data.hw_id))
        user = await get_user(callback.from_user.id)
        hw_status = await hw.aget_status()
        gp = await get_group_and_perms(user.id)
        if hw_status.status not in [3, 5]:
            return False
        if 'Teacher' in gp['groups'] and hw.teacher == user:
            return True
        lesson = await hw.aget_lesson()
        lp = await lesson.aget_learning_plan() if lesson else None
        if lp:
            return (('Metodist' in gp['groups'] and lp.metodist == user) or
                    ('Curator' in gp['groups'] and
                     hw.for_curator and
                     (await lp.curators.filter(pk=user.id).aexists())))

    if await get_access():
        await bot.send_message(chat_id=callback.from_user.id,
                               text="Отправьте мне сообщения, содержащие проверку домашнего задания, "
                                    "после чего нажмите кнопку 'Отправить'\nВы можете отправить текст, "
                                    "фотографии, аудио, видео или голосовые сообщения",
                               reply_markup=homework_typing_keyboard)
        await state.set_state(HomeworkFSM.send_hw_files)
        await state.update_data({'files': [],
                                 'comment': [],
                                 'action': callback_data.action,
                                 'hw_id': callback_data.hw_id})
    else:
        await bot.send_message(callback.from_user.id,
                               text="На данный момент Вы не можете проверить ДЗ")


async def hw_send(tg_id: int, state: FSMContext):
    async def get_hw_log_object(agreement=False):
        query_params = {
            "homework": hw,
            "user": user,
            "status": hwlog_status,
            "comment": "\n".join(state_data['comment'])
        }
        if agreement:
            query_params["agreement"] = {
                "accepted_dt": None,
                "accepted": False
            }
        hw_log = await HomeworkLog.objects.acreate(**query_params)
        await hw_log.files.aset(state_data["files"])
        await hw_log.asave()
        return hw_log

    async def notify_teacher(msg="Пришёл новый ответ от ученика по ДЗ"):
        teacher_tg = await get_tg_id(hw.teacher.id, "main")
        if teacher_tg:
            try:
                msg_object = await bot.send_message(chat_id=teacher_tg,
                                                    text=msg,
                                                    reply_markup=get_homeworks_buttons([{
                                                        'name': await hw.aget_tg_name(["Teacher"]),
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

    async def notify_listener(msg="Пришёл новый ответ от преподавателя по ДЗ"):
        listener_tgs = await get_tg_id(hw.listener.id)
        for listener_tg in listener_tgs:
            try:
                msg_object = await bot.send_message(chat_id=listener_tg.get("tg_id"),
                                                    text=msg,
                                                    reply_markup=get_homeworks_buttons([{
                                                        'name': await hw.aget_tg_name(["Listener"]),
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

    async def notify_methodist(msg="Требуется проверка действия преподавателя"):
        metodist_tg = await get_tg_id(lp.metodist.id, "main")
        if metodist_tg:
            try:
                msg_object = await bot.send_message(chat_id=metodist_tg,
                                                    text=msg,
                                                    reply_markup=get_homeworks_buttons([{
                                                        'name': await hw.aget_tg_name(["Metodist"]),
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

    async def notify_curators(msg="Новое событие с ДЗ"):
        hw_curators = [curator async for curator in lp.curators.all()]
        for curator in hw_curators:
            curator_tg_id = await get_tg_id(curator.id, "main")
            if curator_tg_id:
                try:
                    msg_object = await bot.send_message(chat_id=curator_tg_id,
                                                        text=msg,
                                                        reply_markup=get_homeworks_buttons(
                                                            [{
                                                                'name': await hw.aget_tg_name(["Curator"]),
                                                                'id': hw.id
                                                            }]))
                    await TgBotJournal.objects.acreate(
                        recipient=curator,
                        initiator=user,
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
                        recipient=curator,
                        initiator=user,
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
                    recipient=curator,
                    initiator=user,
                    event=4,
                    data={
                        "status": "error",
                        "text": None,
                        "msg_id": None,
                        "errors": ["У пользователя не привязан Telegram"],
                        "attachments": []
                    }
                )

    state_data = await state.get_data()
    if not state_data['files'] and not state_data['comment']:
        await bot.send_message(chat_id=tg_id,
                               text="Вы не можете отправить пустой ответ. Пожалуйста, пришлите мне текст, фотографии, "
                                    "аудио или голосовые сообщения")
        return
    hw = await (Homework.objects.select_related("teacher")
                .select_related("listener").aget(pk=state_data.get("hw_id")))
    user = await get_user(tg_id)
    lesson = await hw.aget_lesson()
    lp = None
    if lesson:
        lp = await lesson.aget_learning_plan()
    is_listener = hw.listener == user
    if lp:
        is_teacher = (lp.teacher == hw.teacher == user) or (lp.default_hw_teacher == hw.teacher == user)
        is_curator = await lp.curators.filter(pk=user.id).aexists()
        is_methodist = lp.metodist == user
    else:
        is_teacher = hw.teacher == user
        is_curator = False
        is_methodist = False
    hwlog_status = None
    hw_action = state_data.get('action')
    if hw_action == 'send':
        if is_listener:
            hwlog_status = 3
            await bot.send_message(chat_id=tg_id,
                                   text="Решение успешно отправлено\n"
                                        "Ожидайте ответа преподавателя")
            await get_hw_log_object(False)
            await notify_teacher("Новый ответ на ДЗ от ученика")
            if hw.for_curator and (lp and not await lp.curators.filter(id=hw.teacher.id).aexists()):
                await notify_curators("Ученик отправил решение ДЗ")
        else:
            await bot.send_message(chat_id=tg_id,
                                   text="Вы не можете отправить решение на это ДЗ")
    if hw_action in ['check_accept', 'check_revision']:
        if hw_action == 'check_accept':
            hwlog_status = 4
        elif hw_action == 'check_revision':
            hwlog_status = 5
        if is_methodist:
            await get_hw_log_object(False)
            await bot.send_message(chat_id=tg_id,
                                   text="Ответ был отправлен ученику")
            if hw_action == 'check_accept':
                await notify_listener("Домашнее задание принято!")
                await notify_teacher("Методист принял домашнее задание")
            elif hw_action == 'check_revision':
                await notify_listener("Домашнее задание отправлено на доработку")
                await notify_teacher("Методист отправил домашнее задание на доработку")
        elif is_teacher:
            if lp and lp.metodist:
                await get_hw_log_object(True)
                await bot.send_message(chat_id=tg_id,
                                       text="Ответ отправлен на согласование методисту")
                if hw_action == 'check_accept':
                    await notify_methodist("Преподаватель принимает ДЗ. Требуется согласование")
                elif hw_action == 'check_revision':
                    await notify_methodist("Преподаватель отправляет ДЗ на доработку. Требуется согласование")
            else:
                await get_hw_log_object(False)
                await bot.send_message(chat_id=tg_id,
                                       text="Ответ был отправлен ученику")
                if hw_action == 'check_accept':
                    await notify_listener("Домашнее задание принято!")
                    if hw.for_curator:
                        await notify_curators("Преподаватель принял домашнее задание")
                elif hw_action == 'check_revision':
                    await notify_listener("Домашнее задание отправлено на доработку")
                    if hw.for_curator:
                        await notify_curators("Преподаватель отправил на доработку домашнее задание")
        elif is_curator:
            if lp and lp.metodist:
                await get_hw_log_object(True)
                await bot.send_message(chat_id=tg_id,
                                       text="Ответ отправлен на согласование методисту")
                if hw_action == 'check_accept':
                    await notify_methodist("Куратор принимает ДЗ. Требуется согласование")
                elif hw_action == 'check_revision':
                    await notify_methodist("Куратор отправляет ДЗ на доработку. Требуется согласование")
            else:
                await get_hw_log_object(False)
                await bot.send_message(chat_id=tg_id,
                                       text="Ответ был отправлен ученику")
                if hw_action == 'check_accept':
                    await notify_listener("Домашнее задание принято!")
                    if hw.for_curator:
                        await notify_curators("Куратор принял домашнее задание")
                elif hw_action == 'check_revision':
                    await notify_listener("Домашнее задание отправлено на доработку")
                    if hw.for_curator:
                        await notify_curators("Куратор отправил на доработку домашнее задание")
        else:
            await bot.send_message(chat_id=tg_id,
                                   text="Вы не можете отправить решение на это ДЗ")
    await send_menu(tg_id, state)


async def homework_tg_notify(initiator: NewUser, recipient_user_id: int,
                             homeworks: list[Homework], text="У вас новые домашние задания!", log_event=3):
    recipients_tgs = await get_tg_id(recipient_user_id)
    user_groups = [group.name async for group in (await NewUser.objects.aget(pk=recipient_user_id)).groups.all()]
    for user_tg_note in recipients_tgs:
        try:
            msg = await bot.send_message(chat_id=user_tg_note.get("tg_id"),
                                         text=text,
                                         reply_markup=get_homeworks_buttons([{
                                             "name": await hw.aget_tg_name(user_groups),
                                             "id": hw.id
                                         } for hw in homeworks]))
            await TgBotJournal.objects.acreate(
                recipient_id=recipient_user_id,
                initiator=initiator,
                event=log_event,
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
                recipient_id=recipient_user_id,
                initiator=initiator,
                event=log_event,
                data={
                    "status": "error",
                    "text": None,
                    "msg_id": None,
                    "errors": [str(e)],
                    "attachments": []
                }
            )
    if not recipients_tgs:
        await TgBotJournal.objects.acreate(
            recipient_id=recipient_user_id,
            initiator=initiator,
            event=log_event,
            data={
                "status": "error",
                "text": None,
                "msg_id": None,
                "errors": ["У пользователя не привязан Telegram"],
                "attachments": []
            }
        )


async def hw_for_curator_set(callback: CallbackQuery,
                             callback_data: HomeworkCuratorCallback):
    hw = await Homework.objects.aget(pk=callback_data.hw_id)
    hw.for_curator = not hw.for_curator
    await hw.asave()
    await callback.answer("Кураторы теперь могут работать с этим ДЗ" if hw.for_curator else
                          "Кураторы больше не смогут работать с этим ДЗ")
    await callback.message.edit_text(
        text=callback.message.text,
        reply_markup=get_homework_curator_button(callback_data.hw_id, hw.for_curator)
    )
