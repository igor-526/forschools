from aiogram.filters.callback_data import CallbackData


class HomeworkCallback(CallbackData, prefix="hw"):
    hw_id: int
    action: str


class HomeworkMenuCallback(CallbackData, prefix="hwmenu"):
    action: str


class HomeworkNewCallback(CallbackData, prefix="hwnew"):
    lesson_id: int


class HomeworkCuratorCallback(CallbackData, prefix="hwcurator"):
    hw_id: int


class HomeworkNewSelectDateCallback(CallbackData, prefix="hwnew_date"):
    date: str


class HomeworkNewSelectDateFakeCallback(CallbackData, prefix="hwnew_currentdate"):
    action: str


class HomeworkNewSettingCallback(CallbackData, prefix="hwnewset"):
    action: str


class HomeworkLogEditingCallback(CallbackData, prefix="hwlog"):
    action: str
    hw_log_id: int
    file_id: int
