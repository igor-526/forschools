from aiogram.filters.callback_data import CallbackData


class SettingsCallback(CallbackData, prefix="settings"):
    action: str


class SetTimezoneCallback(CallbackData, prefix="set_timezone"):
    new_tz: int | str
