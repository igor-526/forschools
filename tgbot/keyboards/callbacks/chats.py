from aiogram.filters.callback_data import CallbackData


class ChatListCallback(CallbackData, prefix="chat"):
    user_id: int
    usertype: str


class ChatShowMessageCallback(CallbackData, prefix="chat_answer"):
    chat_message_id: int
