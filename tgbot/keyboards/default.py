from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

cancel_button = KeyboardButton(text="Отмена")
yes_button = KeyboardButton(text="Да")
no_button = KeyboardButton(text="Нет")
back_button = KeyboardButton(text="Назад")
ready_button = KeyboardButton(text="Готово")
send_button = KeyboardButton(text="Отправить")
send_homework_button = KeyboardButton(text="Отправить решение ДЗ")

cancel_keyboard = ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[cancel_button]])
ready_cancel_keyboard = ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[ready_button], [cancel_button]])
yes_cancel_keyboard = ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[yes_button], [cancel_button]])
homework_typing_keyboard = ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[cancel_button], [send_button]])


def get_chat_typing_keyboard(send_hw_button=False):
    keys = [[cancel_button], [send_button]]
    if send_hw_button:
        keys.append([send_homework_button])
    return ReplyKeyboardMarkup(resize_keyboard=True, keyboard=keys)
