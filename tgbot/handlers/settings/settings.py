from aiogram import Router, F
from aiogram.types import CallbackQuery
from tgbot.funcs.settings import (settings_switch_show_hw_materials,
                                  settings_switch_notifications_lesson_day,
                                  settings_switch_notifications_lessons_hour,
                                  settings_switch_notifications_tg_connecting,
                                  settings_switch_notifications_email, generate_settings_message,
                                  settings_set_timezone_message, settings_set_timezone)
from tgbot.keyboards.callbacks.settings import SettingsCallback, SetTimezoneCallback

router = Router(name=__name__)


@router.callback_query(SettingsCallback.filter(F.action == 'show_hw_materials'))
async def h_settings_set_hw_materials(callback: CallbackQuery) -> None:
    await settings_switch_show_hw_materials(callback=callback)


@router.callback_query(SettingsCallback.filter(F.action == 'notifications_lesson_day'))
async def h_settings_set_notification_lesson_day(callback: CallbackQuery) -> None:
    await settings_switch_notifications_lesson_day(callback=callback)


@router.callback_query(SettingsCallback.filter(F.action == 'notifications_lessons_hour'))
async def h_settings_set_notification_lesson_hour(callback: CallbackQuery) -> None:
    await settings_switch_notifications_lessons_hour(callback=callback)


@router.callback_query(SettingsCallback.filter(F.action == 'notifications_tg_connecting'))
async def h_settings_set_notification_tg_connecting(callback: CallbackQuery) -> None:
    await settings_switch_notifications_tg_connecting(callback=callback)


@router.callback_query(SettingsCallback.filter(F.action == 'notifications_lessons_email'))
async def h_settings_set_notifications_lessons_email(callback: CallbackQuery) -> None:
    await settings_switch_notifications_email(callback=callback)
    
    
@router.callback_query(SettingsCallback.filter(F.action == 'set_timezone'))
async def h_settings_set_timezone_menu(callback: CallbackQuery) -> None:
    await settings_set_timezone_message(callback)


@router.callback_query(SetTimezoneCallback.filter())
async def h_settings_set_timezone(callback: CallbackQuery, callback_data: SetTimezoneCallback) -> None:
    if callback_data.new_tz == "cancel":
        await generate_settings_message(callback=callback)
        return None
    else:
        await settings_set_timezone(callback, callback_data.new_tz)


@router.callback_query(SettingsCallback.filter(F.action == 'cancel'))
async def h_settings_cancel(callback: CallbackQuery) -> None:
    await callback.message.delete()
