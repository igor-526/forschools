from aiogram.filters.callback_data import CallbackData


class HwCallback(CallbackData, prefix="homework"):
    role: int
    number: int
    action: str
