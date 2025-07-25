import datetime

from aiogram import types
from aiogram.fsm.context import FSMContext

from django.db.models import Q

from lesson.models import Lesson

from profile_management.models import NewUser

from tgbot.create_bot import bot
from tgbot.keyboards.lessons import (get_lesson_place_url_button,
                                     get_schedule_ma_button,
                                     lessons_get_users_buttons)
from tgbot.tg_user_utils import get_user


async def lessons_get_schedule(message: types.Message):
    user = await get_user(message.from_user.id)
    self_schedule = await user.groups.filter(
        name__in=["Admin", "Metodist"]).aexists()
    if self_schedule:
        rm = get_schedule_ma_button(False)
    else:
        rm = get_schedule_ma_button()
    await message.answer(text="Нажмите на кнопку ниже для открытия расписания",
                         reply_markup=rm)


async def lessons_generate_schedule_message(lessons: list[Lesson],
                                            monday: datetime.date,
                                            mode="listener",
                                            user=None) -> str:
    def get_lessons_string(lessonobj):
        lstring = (f"{lessonobj['start_time'].strftime('%H:%M')}-"
                   f"{lessonobj['end_time'].strftime('%H:%M')} - ")
        if mode == "listener":
            lstring += (f'{lessonobj["teacher"].first_name} '
                        f'{lessonobj["teacher"].last_name}\n')
        elif mode == "teacher":
            listeners = [f"{listener.first_name} {listener.last_name}"
                         for listener in lessonobj["listeners"]]
            lstring += ", ".join(listeners)
            lstring += "\n"
        return lstring

    msg = (f"Расписание на неделю с {monday.strftime('%d.%m.%Y')} по"
           f" {(monday+datetime.timedelta(days=6)).strftime('%d.%m.%Y')}")
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
    schedule["monday"] = list(filter(
        lambda lesson: lesson["date"].day == monday.day, lessondata
    ))
    schedule["tuesday"] = list(filter(
        lambda lesson: lesson["date"].day == monday.day+1, lessondata
    ))
    schedule["wednesday"] = list(filter(
        lambda lesson: lesson["date"].day == monday.day+2, lessondata
    ))
    schedule["thursday"] = list(filter(
        lambda lesson: lesson["date"].day == monday.day+3, lessondata
    ))
    schedule["friday"] = list(filter(
        lambda lesson: lesson["date"].day == monday.day+4, lessondata
    ))
    schedule["saturday"] = list(filter(
        lambda lesson: lesson["date"].day == monday.day+5, lessondata
    ))
    schedule["sunday"] = list(filter(
        lambda lesson: lesson["date"].day == monday.day+6, lessondata
    ))
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
        await message.answer(
            text=f"Никого не удалось найти по запросу '{message.text}'"
        )
    else:
        await message.answer("Вот что удалось найти:",
                             reply_markup=lessons_get_users_buttons(userlist))


def get_lesson_can_be_passed(lesson: Lesson) -> bool:
    today = datetime.datetime.now()
    return lesson.date <= today.date()


async def f_lessons_show_place_access_info(lesson_id, tg_id) -> None:
    try:
        lesson = await Lesson.objects.select_related(
            "place").aget(id=lesson_id)
    except Lesson.DoesNotExist:
        await bot.send_message(
            chat_id=tg_id,
            text="Произошла ошибка. Занятие не найдено"
        )
        return None
    if lesson.place is None:
        await bot.send_message(
            chat_id=tg_id,
            text="Произошла ошибка. Место проведения отсуствует"
        )
        return None

    msg = "Данные для подключения к занятию:\n"
    if lesson.place.url:
        msg += f'<b>Ссылка: </b><code>{lesson.place.url}</code>\n'
    if lesson.place.conf_id:
        msg += (f'<b>Идентификатор конференции: </b>'
                f'<code>{lesson.place.conf_id}</code>\n')
    if lesson.place.access_code:
        msg += (f'<b>Код для подключения: </b>'
                f'<code>{lesson.place.access_code}</code>\n')
    await bot.send_message(chat_id=tg_id,
                           text=msg,
                           reply_markup=get_lesson_place_url_button(
                               url=lesson.place.url
                           ))
