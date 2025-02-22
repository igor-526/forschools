from aiogram.filters.callback_data import CallbackData


class ChatListCallback(CallbackData, prefix="chat"):
    user_id: int
    usertype: str


class ChatAnswerMessageCallback(CallbackData, prefix="chat_answer"):
    chat_message_id: int
    message_type: str
