from aiogram.types import InlineKeyboardMarkup, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder


def get_miniapp_button() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="1",
        web_app=WebAppInfo(url="https://kitai-school.forschools.ru/ma/lessons/1493/")
    )
    builder.button(
        text="2",
        web_app=WebAppInfo(url="https://kitai-school.forschools.ru/ma/lessons/1601/")
    )
    builder.button(
        text="3",
        web_app=WebAppInfo(url="https://kitai-school.forschools.ru/ma/lessons/863/")
    )
    builder.button(
        text="4",
        web_app=WebAppInfo(url="https://kitai-school.forschools.ru/ma/lessons/1698/")
    )
    builder.button(
        text="5",
        web_app=WebAppInfo(url="https://kitai-school.forschools.ru/ma/lessons/864/")
    )
    builder.adjust(1)
    return builder.as_markup()
