from aiogram.types import InlineKeyboardMarkup, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder
from tgbot.keyboards.callbacks.lessons import LessonScheduleListCallback, LessonPlaceCallback
from tgbot.keyboards.utils import keyboard_anti_cache_url


def lessons_get_users_buttons(users: list) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for user in users:
        builder.button(
            text=f"{user.get('first_name')} {user.get('last_name')}",
            callback_data=LessonScheduleListCallback(user_id=user.get('user_id'))
        )
    builder.adjust(1)
    return builder.as_markup()


def get_lesson_ma_button(lesson_id: int) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="Посмотреть",
        web_app=WebAppInfo(url=keyboard_anti_cache_url(f"https://kitai-school.forschools.ru/ma/lessons/{lesson_id}/"))
    )
    builder.adjust(1)
    return builder.as_markup()


def get_schedule_ma_button(self=True) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    url = "https://kitai-school.forschools.ru/ma/lessons/schedule/0/" if self \
        else "https://kitai-school.forschools.ru/ma/lessons/schedule/"
    builder.button(
        text="Открыть расписание",
        web_app=WebAppInfo(url=keyboard_anti_cache_url(url))
    )
    builder.adjust(1)
    return builder.as_markup()


def get_lesson_place_button(url: str, place_id: int = None) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="Открыть ссылку",
        url=url
    )
    if place_id:
        builder.button(
            text="Данные для доступа",
            callback_data=LessonPlaceCallback(place_id=place_id)
        )
    builder.adjust(1)
    return builder.as_markup()
