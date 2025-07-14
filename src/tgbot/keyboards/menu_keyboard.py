from aiogram.types import (InlineKeyboardMarkup,
                           KeyboardButton,
                           ReplyKeyboardMarkup)
from aiogram.utils.keyboard import InlineKeyboardBuilder

from tgbot.keyboards.utils import WebPlatformUrl

hw_button = KeyboardButton(text="Домашние задания")
settings_button = KeyboardButton(text="Настройки")
multiuser_button = KeyboardButton(text="Сменить аккаунт")
web_button = KeyboardButton(text="Платформа")
lessons_button = KeyboardButton(text="Расписание")


def get_menu_keyboard(chats: int, homeworks=False,
                      messages=False, settings=False,
                      multiuser=False, lessons=False) -> ReplyKeyboardMarkup:
    keys = []
    if homeworks:
        keys.append([hw_button])
    if messages:
        keys.append([KeyboardButton(text=f'История сообщений ({chats})')])
    if lessons:
        keys.append([lessons_button])
    keys.append([web_button])
    if settings:
        keys.append([settings_button])
    if multiuser:
        keys.append([multiuser_button])
    return ReplyKeyboardMarkup(resize_keyboard=True, keyboard=keys)


async def get_platform_button(tg_id: int) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    url = WebPlatformUrl()
    await url.set_token_by_tg_id(tg_id=tg_id)
    builder.button(
        text="Перейти на платформу",
        url=url.get_url()
    )
    builder.adjust(1)
    return builder.as_markup()
