import datetime
from aiogram import types
from aiogram.fsm.context import FSMContext
from django.db.models import Q
from lesson.models import Lesson
from profile_management.models import NewUser
from tgbot.create_bot import bot
from tgbot.finite_states.lessons import LessonsFSM
from tgbot.funcs.menu import send_menu
from tgbot.keyboards.default import cancel_keyboard
from tgbot.keyboards.lessons import lessons_get_users_buttons, get_schedule_ma_button
from tgbot.utils import get_user, get_group_and_perms


async def lessons_generate_schedule_message(lessons: list[Lesson], monday: datetime.date,
                                            mode="listener", user=None) -> str:
    def get_lessons_string(lessonobj):
        lstring = f"{lessonobj['start_time'].strftime('%H:%M')}-{lessonobj['end_time'].strftime('%H:%M')} - "
        if mode == "listener":
            lstring += f'{lessonobj["teacher"].first_name} {lessonobj["teacher"].last_name}\n'
        elif mode == "teacher":
            listeners = [f"{l.first_name} {l.last_name}" for l in lessonobj["listeners"]]
            lstring += ", ".join(listeners)
            lstring += "\n"
        return lstring

    msg = f"Расписание на неделю с {monday.strftime('%d.%m.%Y')} по {(monday+datetime.timedelta(days=6)).strftime('%d.%m.%Y')}"
    msg += f' для <b>{user}</b>\n' if user else '\n'
    if not lessons:
        msg += "<b>ОТСУТСТВУЕТ!</b>"
        return msg
    schedule = {
        "monday": [],
        "tuesday": [],
        "wednesday": [],
        "thursday": [],
        "friday": [],
        "saturday": [],
        "sunday": [],
    }
    lessondata = []
    for lesson in lessons:
        lessondata.append({
            "date": lesson.date,
            "teacher": await lesson.aget_teacher(),
            "listeners": await lesson.aget_listeners(),
            "start_time": lesson.start_time,
            "end_time": lesson.end_time
        })
    schedule["monday"] = list(filter(lambda lesson: lesson["date"].day == monday.day, lessondata))
    schedule["tuesday"] = list(filter(lambda lesson: lesson["date"].day == monday.day+1, lessondata))
    schedule["wednesday"] = list(filter(lambda lesson: lesson["date"].day == monday.day+2, lessondata))
    schedule["thursday"] = list(filter(lambda lesson: lesson["date"].day == monday.day+3, lessondata))
    schedule["friday"] = list(filter(lambda lesson: lesson["date"].day == monday.day+4, lessondata))
    schedule["saturday"] = list(filter(lambda lesson: lesson["date"].day == monday.day+5, lessondata))
    schedule["sunday"] = list(filter(lambda lesson: lesson["date"].day == monday.day+6, lessondata))
    if schedule["monday"]:
        msg += "\n<b>Понедельник:</b>\n"
        for lesson in schedule["monday"]:
            msg += get_lessons_string(lesson)
    if schedule["tuesday"]:
        msg += "\n<b>Вторник:</b>\n"
        for lesson in schedule["tuesday"]:
            msg += get_lessons_string(lesson)
    if schedule["wednesday"]:
        msg += "\n<b>Среда:</b>\n"
        for lesson in schedule["wednesday"]:
            msg += get_lessons_string(lesson)
    if schedule["thursday"]:
        msg += "\n<b>Четверг:</b>\n"
        for lesson in schedule["thursday"]:
            msg += get_lessons_string(lesson)
    if schedule["friday"]:
        msg += "\n<b>Пятница:</b>\n"
        for lesson in schedule["friday"]:
            msg += get_lessons_string(lesson)
    if schedule["saturday"]:
        msg += "\n<b>Суббота:</b>\n"
        for lesson in schedule["saturday"]:
            msg += get_lessons_string(lesson)
    if schedule["sunday"]:
        msg += "\n<b>Воскресенье:</b>\n"
        for lesson in schedule["sunday"]:
            msg += get_lessons_string(lesson)
    return msg


async def lessons_get_schedule(message: types.Message):
    user = await get_user(message.from_user.id)
    self_schedule = await user.groups.filter(name__in=["Admin", "Metodist"]).aexists()
    if self_schedule:
        rm = get_schedule_ma_button(False)
    else:
        rm = get_schedule_ma_button()
    await message.answer(text="Нажмите на кнопку ниже для открытия расписания",
                         reply_markup=rm)


async def lessons_get_schedule_old(tg_id: int, state: FSMContext, user: NewUser = None):
    if not user:
        user = await get_user(tg_id)
    perms = await get_group_and_perms(user.id)
    current_date = datetime.date.today()
    monday = current_date - datetime.timedelta(days=current_date.weekday())
    if "Admin" in perms.get("groups") or "Metodist" in perms.get("groups"):
        users = [{
            "first_name": user.first_name,
            "last_name": user.last_name,
            "user_id": user.id,
        } async for user in NewUser.objects.filter(groups__name__in=["Teacher", "Listener"],
                                                   is_active=True)[:15]]
        await bot.send_message(chat_id=tg_id,
                               text="Выберите пользователя, чьё расписание необходимо показать:",
                               reply_markup=lessons_get_users_buttons(users))
        await bot.send_message(chat_id=tg_id,
                               text="Если пользователя в списке нет, введите фразу для поиска (фамилия или имя) или "
                                    "<b>нажмите кноку 'Отмена'</b>",
                               reply_markup=cancel_keyboard)
        await state.set_state(LessonsFSM.user_search)
    if "Teacher" in perms.get("groups"):
        lessons = [lesson async for lesson in Lesson.objects.filter(Q(learningphases__learningplan__teacher=user,
                                                                      date__gte=monday,
                                                                      date__lte=monday + datetime.timedelta(days=6)) |
                                                                    Q(replace_teacher=user,
                                                                      date__gte=monday,
                                                                      date__lte=monday + datetime.timedelta(days=6))
                                                                    )]
        msg = await lessons_generate_schedule_message(lessons, monday, "teacher", user)
        await bot.send_message(chat_id=tg_id, text=msg)
        await send_menu(tg_id, state)
    if "Listener" in perms.get("groups"):
        lessons = [lesson async for lesson in Lesson.objects.filter(learningphases__learningplan__listeners=user,
                                                                    date__gte=monday,
                                                                    date__lte=monday + datetime.timedelta(days=6))]
        msg = await lessons_generate_schedule_message(lessons, monday, "listener", user)
        await bot.send_message(chat_id=tg_id, text=msg)
        await send_menu(tg_id, state)


async def lessons_search_users(message: types.Message, state: FSMContext):
    userlist = []
    for query in message.text.split(" "):
        users = [{
            "first_name": user.first_name,
            "last_name": user.last_name,
            "user_id": user.id
        } async for user in NewUser.objects.filter(
            Q(first_name__iregex=query,
              is_active=True) |
            Q(last_name__iregex=query,
              is_active=True)
        ).distinct()]
        for user in users:
            if user not in userlist:
                userlist.append(user)
    if not userlist:
        await message.answer(text=f"Никого не удалось найти по запросу '{message.text}'")
    else:
        await message.answer("Вот что удалось найти:",
                             reply_markup=lessons_get_users_buttons(userlist))


def get_lesson_can_be_passed(lesson: Lesson):
    today = datetime.datetime.now()
    if lesson.date > today.date():
        return False
    elif lesson.date == today.date():
        if lesson.end_time > today.time():
            return False
    return True
