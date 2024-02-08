from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder

from tgbot.keyboards.callbacks import HwCallback


def get_show_keys_hw_l(hw_id: int, role: int, action='show') -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="Посмотреть",
        callback_data=HwCallback(role=role, number=hw_id, action=action)
    )
    return builder.as_markup()
