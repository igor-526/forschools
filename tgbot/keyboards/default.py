from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

cancel_button = KeyboardButton(text="Отмена")
yes_button = KeyboardButton(text="Да")
no_button = KeyboardButton(text="Нет")
back_button = KeyboardButton(text="Назад")

cancel_keyboard = ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[cancel_button]])
