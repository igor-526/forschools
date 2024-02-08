from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

add_lesson_button = KeyboardButton(text="Создать урок")
add_hw_button = KeyboardButton(text="Создать ДЗ")

menu_keyboard = ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[add_lesson_button, add_hw_button]])
