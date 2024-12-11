from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo

from tgbot.keyboards.utils import keyboard_anti_cache_url

materials_button = KeyboardButton(text="Материалы")
hw_button = KeyboardButton(text="Домашние задания")
lessons_self_button = KeyboardButton(text="Расписание", web_app=WebAppInfo(
    url=keyboard_anti_cache_url('https://kitai-school.forschools.ru/ma/lessons/schedule/0/')))
lessons_select_button = KeyboardButton(text="Расписание", web_app=WebAppInfo(
    url=keyboard_anti_cache_url('https://kitai-school.forschools.ru/ma/lessons/schedule/')))
settings_button = KeyboardButton(text="Настройки")

menu_keyboard = ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[materials_button], [hw_button]])


def get_menu_keyboard(chats: int, materials=False, homeworks=False,
                      lessons=False, messages=False, settings=False):
    keys = []
    if materials:
        keys.append([materials_button])
    if homeworks:
        keys.append([hw_button])
    if lessons == "self":
        keys.append([lessons_self_button])
    if lessons == "select":
        keys.append([lessons_select_button])
    if messages and chats > 0:
        keys.append([KeyboardButton(text=f'Сообщения ({chats})')])
    if settings:
        keys.append([settings_button])
    return ReplyKeyboardMarkup(resize_keyboard=True, keyboard=keys)



