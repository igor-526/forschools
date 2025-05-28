from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
from dls.settings import ALLOWED_HOSTS

materials_button = KeyboardButton(text="Материалы")
hw_button = KeyboardButton(text="Домашние задания")
lessons_button = KeyboardButton(text="Расписание")
settings_button = KeyboardButton(text="Настройки")
multiuser_button = KeyboardButton(text="Сменить аккаунт")


def get_web_button(token: str) -> KeyboardButton:
    return KeyboardButton(text="Платформа",
                          web_app=WebAppInfo(url=f'{ALLOWED_HOSTS[0]}/login_tg/?token={token}'))


def get_menu_keyboard(chats: int, materials=False, homeworks=False,
                      lessons=False, messages=False, settings=False,
                      multiuser=False, token: str = None) -> ReplyKeyboardMarkup:
    keys = []
    if materials:
        keys.append([materials_button])
    if homeworks:
        keys.append([hw_button])
    if lessons:
        keys.append([lessons_button])
    if messages:
        keys.append([KeyboardButton(text=f'История сообщений ({chats})')])
    if token:
        keys.append([get_web_button(token)])
    if settings:
        keys.append([settings_button])
    if multiuser:
        keys.append([multiuser_button])
    return ReplyKeyboardMarkup(resize_keyboard=True, keyboard=keys)



