from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from tgbot.keyboards.callbacks.chats import ChatListCallback, ChatAnswerCallback


def chats_get_users_buttons(chats: list, read=True) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for chat in chats:
        if read:
            action = "send" if chat.get("unreaded") == 0 else "show"
        else:
            action = "send"
        builder.button(
            text=f"{chat.get('name')} ({chat.get('unreaded')})",
            callback_data=ChatListCallback(user_id=chat.get('id'),
                                           action=action)
        )
    builder.adjust(1)
    return builder.as_markup()


def chats_get_answer_button(chat_message_id: int) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="Ответить",
        callback_data=ChatAnswerCallback(chat_message_id=chat_message_id)
    )
    builder.adjust(1)
    return builder.as_markup()
