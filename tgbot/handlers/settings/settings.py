from aiogram import types, Router, F
from aiogram.types import CallbackQuery
from tgbot.funcs.settings import settings_switch_show_hw_materials
from tgbot.keyboards.callbacks.settings import SettingsCallback

router = Router(name=__name__)


@router.callback_query(SettingsCallback.filter(F.action == 'show_hw_materials'))
async def h_homework_sethw(callback: CallbackQuery) -> None:
    await settings_switch_show_hw_materials(callback=callback)


@router.callback_query(SettingsCallback.filter(F.action == 'cancel'))
async def h_settings_cancel(callback: CallbackQuery) -> None:
    await callback.message.delete()
