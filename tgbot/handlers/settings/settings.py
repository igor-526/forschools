from aiogram import types, Router, F
from aiogram.types import CallbackQuery
from tgbot.funcs.settings import (settings_switch_show_hw_materials,
                                  settings_switch_notifications_lesson_day,
                                  settings_switch_notifications_lessons_hour,
                                  settings_switch_notifications_tg_connecting)
from tgbot.keyboards.callbacks.settings import SettingsCallback

router = Router(name=__name__)


@router.callback_query(SettingsCallback.filter(F.action == 'show_hw_materials'))
async def h_homework_set_hw_materials(callback: CallbackQuery) -> None:
    await settings_switch_show_hw_materials(callback=callback)


@router.callback_query(SettingsCallback.filter(F.action == 'notifications_lesson_day'))
async def h_homework_set_notification_lesson_day(callback: CallbackQuery) -> None:
    await settings_switch_notifications_lesson_day(callback=callback)


@router.callback_query(SettingsCallback.filter(F.action == 'notifications_lessons_hour'))
async def h_homework_set_notification_lesson_hour(callback: CallbackQuery) -> None:
    await settings_switch_notifications_lessons_hour(callback=callback)


@router.callback_query(SettingsCallback.filter(F.action == 'notifications_tg_connecting'))
async def h_homework_set_notification_tg_connecting(callback: CallbackQuery) -> None:
    await settings_switch_notifications_tg_connecting(callback=callback)


@router.callback_query(SettingsCallback.filter(F.action == 'cancel'))
async def h_settings_cancel(callback: CallbackQuery) -> None:
    await callback.message.delete()
