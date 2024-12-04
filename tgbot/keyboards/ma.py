from aiogram.types import InlineKeyboardMarkup, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder


def get_miniapp_button() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="start",
        web_app=WebAppInfo(url="https://kitai-school.forschools.ru/ma/lessons/")
    )
    builder.adjust(1)
    return builder.as_markup()
