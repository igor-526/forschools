from aiogram.filters.callback_data import CallbackData


class HomeworkCallback(CallbackData, prefix="hw"):
    hw_id: int
    action: str


class HomeworkLogCallback(CallbackData, prefix="hwlog"):
    log_id: int
