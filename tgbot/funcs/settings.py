from aiogram.types import CallbackQuery
from profile_management.models import Telegram
from tgbot.create_bot import bot
from aiogram import types
from tgbot.keyboards.settings import get_settings_keyboard


async def generate_settings_message(message: types.Message = None, callback: CallbackQuery = None):
    tg_note = Telegram()
    if message:
        tg_note = await Telegram.objects.aget(tg_id=message.from_user.id)
    elif callback:
        tg_note = await Telegram.objects.aget(tg_id=callback.from_user.id)
    settings = {
        'show_hw_materials': tg_note.setting_show_hw_materials
    }
    if message:
        await message.answer(text="Выберите пункт:",
                             reply_markup=get_settings_keyboard(settings))
        await message.delete()
    elif callback:
        await callback.message.delete()
        await bot.send_message(chat_id=callback.from_user.id,
                               text="Выберите пункт:",
                               reply_markup=get_settings_keyboard(settings))


async def settings_switch_show_hw_materials(callback: CallbackQuery):
    tg_note = await Telegram.objects.aget(tg_id=callback.from_user.id)
    if tg_note.setting_show_hw_materials:
        tg_note.setting_show_hw_materials = False
        await bot.send_message(chat_id=callback.from_user.id,
                               text="Материалы в домашних заданиях больше не будут показываться автоматически")
    else:
        tg_note.setting_show_hw_materials = True
        await bot.send_message(chat_id=callback.from_user.id,
                               text="Материалы в домашних заданиях теперь будут показываться автоматически")
    await tg_note.asave()
    await generate_settings_message(callback=callback)
