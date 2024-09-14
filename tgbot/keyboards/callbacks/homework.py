from aiogram.filters.callback_data import CallbackData


class HomeworkCallback(CallbackData, prefix="hw"):
    hw_id: int
    action: str


class HomeworkLogCallback(CallbackData, prefix="hwlog"):
    log_id: int


class HomeworkMenuCallback(CallbackData, prefix="hwmenu"):
    action: str


class HomeworkNewCallback(CallbackData, prefix="hwnew"):
    user_id: int


class HomeworkNewSettingCallback(CallbackData, prefix="hwnewset"):
    action: str
