from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from tgbot.keyboards.callbacks.multiuser import MultiUserCallback


def get_multiuser_keyboard(users: list) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for user in users:
        builder.button(
            text=user.get("name"),
            callback_data=MultiUserCallback(id=user.get("id"))
        )
    builder.adjust(1)
    return builder.as_markup()
