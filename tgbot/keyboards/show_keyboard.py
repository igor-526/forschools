from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder




def get_show_keys_hw_l(hw_id: int, role: int, action='show') -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="Посмотреть",
    )
    return builder.as_markup()
