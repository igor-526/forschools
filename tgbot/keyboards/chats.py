from aiogram.types import InlineKeyboardMarkup, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder
from tgbot.keyboards.callbacks.chats import ChatListCallback, ChatAnswerMessageCallback
from tgbot.keyboards.utils import keyboard_anti_cache_url


def chats_get_users_buttons(chats: list) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for chat in chats:
        builder.button(
            text=f"{chat.get('name')}{(' [' + chat.get('note') + ']') if chat.get('note') else ''}",
            callback_data=ChatListCallback(user_id=chat.get('id'),
                                           usertype=chat.get('usertype'),)
        )
    builder.adjust(1)
    return builder.as_markup()


def chats_get_answer_message_button(chat_message_id: int, message_type="user") -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="Ответить на это сообщение",
        callback_data=ChatAnswerMessageCallback(chat_message_id=chat_message_id,
                                                message_type=message_type)
    )
    builder.adjust(1)
    return builder.as_markup()


def chats_get_show_message_page_button(admin_messages: bool = False) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="Обычные сообщения" if admin_messages else "Открыть",
        web_app=WebAppInfo(
            url=keyboard_anti_cache_url("/ma/messages/"))
    )
    if admin_messages:
        builder.button(
            text="Сообщения администратору" if admin_messages else "Открыть",
            web_app=WebAppInfo(
                url=keyboard_anti_cache_url("/ma/messages/admin_messages/"))
        )
    builder.adjust(1)
    return builder.as_markup()
