from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

materials_button = KeyboardButton(text="Материалы")
hw_button = KeyboardButton(text="Домашние задания")

menu_keyboard = ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[materials_button], [hw_button]])
