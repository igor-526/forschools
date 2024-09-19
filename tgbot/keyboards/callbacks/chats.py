from aiogram.filters.callback_data import CallbackData


class ChatListCallback(CallbackData, prefix="chat"):
    user_id: int


class ChatShowMessageCallback(CallbackData, prefix="chat_answer"):
    chat_message_id: int
