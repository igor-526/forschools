from aiogram import Router, F
from aiogram.types import CallbackQuery

from tgbot.funcs.multiuser import f_multiuser_change_user
from tgbot.funcs.settings import (settings_switch_show_hw_materials,
                                  settings_switch_notifications_lesson_day,
                                  settings_switch_notifications_lessons_hour,
                                  settings_switch_notifications_tg_connecting,
                                  settings_switch_notifications_email)
from tgbot.keyboards.callbacks.multiuser import MultiUserCallback
from tgbot.keyboards.callbacks.settings import SettingsCallback

router = Router(name=__name__)


@router.callback_query(MultiUserCallback.filter())
async def h_multiuser_change_user(callback: CallbackQuery, callback_data: MultiUserCallback) -> None:
    await f_multiuser_change_user(callback, callback_data.id)
