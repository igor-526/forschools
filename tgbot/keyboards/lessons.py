from aiogram.types import InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder
from profile_management.models import Telegram
from tgbot.keyboards.callbacks.lessons import LessonScheduleListCallback, LessonPlaceCallback
from tgbot.keyboards.utils import WebPlatformUrl


def lessons_get_users_buttons(users: list) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for user in users:
        builder.button(
            text=f"{user.get('first_name')} {user.get('last_name')}",
            callback_data=LessonScheduleListCallback(user_id=user.get('user_id'))
        )
    builder.adjust(1)
    return builder.as_markup()


def get_lesson_web_button(tg_note: Telegram,
                          lesson_id: int) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    url = WebPlatformUrl(f"lessons/{lesson_id}")
    url.set_token_by_tg_note(tg_note=tg_note)
    builder.button(
        text="Посмотреть",
        url=url.get_url()
    )
    builder.adjust(1)
    return builder.as_markup()


def get_lesson_place_button(lesson_id: int) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="Показать",
        callback_data=LessonPlaceCallback(lesson_id=lesson_id)
    )
    builder.adjust(1)
    return builder.as_markup()


def get_lesson_place_url_button(url: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="Перейти по ссылке",
                                               url=url)]])


def get_lesson_review_field_keyboard(state_data: dict, current: str) -> ReplyKeyboardMarkup | None:
    def get_for_name() -> list[KeyboardButton] | None:
        if state_data["lesson_review"].get("name") is not None:
            return [KeyboardButton(text="Далее")]
        return None

    def get_for_materials() -> list[KeyboardButton]:
        if state_data["lesson_review"].get("materials") is not None:
            return [KeyboardButton(text="Назад"), KeyboardButton(text="Далее")]
        return [KeyboardButton(text="Назад")]

    def get_for_lexis() -> list[KeyboardButton]:
        if state_data["lesson_review"].get("lexis") is not None:
            return [KeyboardButton(text="Назад"), KeyboardButton(text="Далее")]
        return [KeyboardButton(text="Назад")]

    def get_for_grammar() -> list[KeyboardButton]:
        if state_data["lesson_review"].get("grammar") is not None:
            return [KeyboardButton(text="Назад"), KeyboardButton(text="Далее")]
        return [KeyboardButton(text="Назад")]

    def get_for_note() -> list[KeyboardButton]:
        if state_data["lesson_review"].get("note") is not None:
            return [KeyboardButton(text="Назад"), KeyboardButton(text="Далее")]
        return [KeyboardButton(text="Назад")]

    def get_for_org() -> list[KeyboardButton]:
        if state_data["lesson_review"].get("org") is not None:
            return [KeyboardButton(text="Назад"), KeyboardButton(text="Далее")]
        return [KeyboardButton(text="Назад")]

    if state_data.get("lesson_review") is None:
        return None
    if current == "confirm":
        return ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[KeyboardButton(text="Подтвердить")],
                                                                   [KeyboardButton(text="Изменить наименование")],
                                                                   [KeyboardButton(text="Изменить материалы")],
                                                                   [KeyboardButton(text="Изменить лексику")],
                                                                   [KeyboardButton(text="Изменить грамматику")],
                                                                   [KeyboardButton(text="Изменить примечание")],
                                                                   [KeyboardButton(text="Изменить орг. моменты")],
                                                                   [KeyboardButton(text="Отмена")]])
    elif current == "name":
        actions = get_for_name()
        if actions is not None:
            return ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[actions,
                                                                       [KeyboardButton(text="Отмена")]])
        return ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[KeyboardButton(text="Отмена")]])
    elif current == "materials":
        return ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[get_for_materials(),
                                                                   [KeyboardButton(text="Отмена")]])
    elif current == "lexis":
        return ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[get_for_lexis(),
                                                                   [KeyboardButton(text="Отмена")]])
    elif current == "grammar":
        return ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[get_for_grammar(),
                                                                   [KeyboardButton(text="Отмена")]])
    elif current == "note":
        return ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[get_for_note(),
                                                                   [KeyboardButton(text="Отмена")]])
    elif current == "org":
        return ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[get_for_org(),
                                                                   [KeyboardButton(text="Отмена")]])

    return None