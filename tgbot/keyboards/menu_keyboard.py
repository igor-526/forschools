from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder

from tgbot.keyboards.utils import WebPlatformUrl

materials_button = KeyboardButton(text="Материалы")
hw_button = KeyboardButton(text="Домашние задания")
lessons_button = KeyboardButton(text="Расписание")
settings_button = KeyboardButton(text="Настройки")
multiuser_button = KeyboardButton(text="Сменить аккаунт")
web_button = KeyboardButton(text="Платформа")


def get_menu_keyboard(chats: int, materials=False, homeworks=False,
                      lessons=False, messages=False, settings=False,
                      multiuser=False) -> ReplyKeyboardMarkup:
    keys = []
    if materials:
        keys.append([materials_button])
    if homeworks:
        keys.append([hw_button])
    if lessons:
        keys.append([lessons_button])
    if messages:
        keys.append([KeyboardButton(text=f'История сообщений ({chats})')])
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



