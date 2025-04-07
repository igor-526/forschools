from aiogram.filters.callback_data import CallbackData


class MultiUserCallback(CallbackData, prefix="multiuser"):
    id: int
