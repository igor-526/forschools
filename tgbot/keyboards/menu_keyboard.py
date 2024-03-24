from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

materials_button = KeyboardButton(text="Материалы")

menu_keyboard = ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[materials_button]])
