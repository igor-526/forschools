from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from tgbot.keyboards.callbacks.lessons import LessonScheduleListCallback


def lessons_get_users_buttons(users: list) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for user in users:
        builder.button(
            text=f"{user.get('first_name')} {user.get('last_name')}",
            callback_data=LessonScheduleListCallback(user_id=user.get('user_id'))
        )
    builder.adjust(1)
    return builder.as_markup()
