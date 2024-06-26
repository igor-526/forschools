from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

cancel_button = KeyboardButton(text="Отмена")
yes_button = KeyboardButton(text="Да")
no_button = KeyboardButton(text="Нет")
back_button = KeyboardButton(text="Назад")
ready_button = KeyboardButton(text="Готово")

cancel_keyboard = ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[cancel_button]])
ready_cancel_keyboard = ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[ready_button], [cancel_button]])
yes_cancel_keyboard = ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[yes_button], [cancel_button]])
