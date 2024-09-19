from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from tgbot.keyboards.callbacks.chats import ChatListCallback, ChatShowMessageCallback


def chats_get_users_buttons(chats: list) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for chat in chats:
        builder.button(
            text=f"{chat.get('name')}",
            callback_data=ChatListCallback(user_id=chat.get('id'))
        )
    builder.adjust(1)
    return builder.as_markup()


def chats_get_show_message_button(chat_message_id: int) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="Посмотреть",
        callback_data=ChatShowMessageCallback(chat_message_id=chat_message_id)
    )
    builder.adjust(1)
    return builder.as_markup()
