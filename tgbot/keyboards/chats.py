from aiogram.types import InlineKeyboardMarkup, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder

from profile_management.models import Telegram
from tgbot.keyboards.callbacks.chats import (ChatAnswerMessageCallback,
                                             ChatListCallback)
from tgbot.keyboards.utils import keyboard_anti_cache_url, get_web_url


def chats_get_users_buttons(chats: list) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for chat in chats:
        builder.button(
            text=chat.get('name'),
            callback_data=ChatListCallback(user_id=chat.get('id'),
                                           usertype=chat.get('usertype'))
        )
    builder.adjust(1)
    return builder.as_markup()


def chats_get_answer_message_button(chat_message_id: int,
                                    chat_type: int) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="Ответить на это сообщение",
        callback_data=ChatAnswerMessageCallback(
            chat_message_id=chat_message_id,
            chat_type=chat_type
        )
    )
    builder.adjust(1)
    return builder.as_markup()


async def chats_get_show_message_page_button(tg_note: Telegram, admin_messages: bool = False) \
        -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="Обычные сообщения" if admin_messages else "Открыть",
        web_app=WebAppInfo(
            url=await get_web_url(tg_note=tg_note,
                                  path="messages"))
    )
    if admin_messages:
        builder.button(
            text="Сообщения администратору" if admin_messages else "Открыть",
            web_app=WebAppInfo(
                url=keyboard_anti_cache_url("/ma/messages/admin_messages/"))
        )
    builder.adjust(1)
    return builder.as_markup()
