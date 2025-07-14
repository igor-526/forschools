from aiogram.types import CallbackQuery, Message

from profile_management.models import Telegram

from tgbot.create_bot import bot
from tgbot.keyboards.settings import (get_settings_keyboard,
                                      get_settings_timezone_keyboard)


async def generate_settings_message(message: Message = None,
                                    callback: CallbackQuery = None):
    tg_id = message.from_user.id if message else callback.from_user.id
    tg_note = await Telegram.objects.select_related("user").aget(tg_id=tg_id)
    is_teacher = await tg_note.user.groups.filter(name="Teacher").aexists()
    settings = {
        'show_hw_materials': tg_note.setting_show_hw_materials,
        'notifications_lesson_day': tg_note.setting_notifications_lesson_day,
        'notifications_lessons_hour':
            tg_note.setting_notifications_lessons_hour,
        'notifications_tg_connecting':
            tg_note.setting_notifications_tg_connecting
            if await tg_note.user.groups.filter(
                name="Admin").aexists() else None,
        'notifications_lessons_email': tg_note.user.setting_notifications_email
        if (tg_note.user.email and tg_note.user.email) != '' else None,
        'timezone': tg_note.user.tz,
        'lesson_review_mode': (tg_note.setting_lesson_review_form_mode if
                               is_teacher else None),
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
        await callback.answer(
            text="Материалы в домашних заданиях "
                 "больше не будут показываться автоматически"
        )
    else:
        tg_note.setting_show_hw_materials = True
        await callback.answer(
            text="Материалы в домашних заданиях "
                 "теперь будут показываться автоматически"
        )
    await tg_note.asave()
    await generate_settings_message(callback=callback)


async def settings_switch_notifications_lesson_day(callback: CallbackQuery):
    tg_note = await Telegram.objects.aget(tg_id=callback.from_user.id)
    if tg_note.setting_notifications_lesson_day:
        tg_note.setting_notifications_lesson_day = False
        await callback.answer(
            text="Уведомлений о занятии за сутки больше не будет"
        )
    else:
        tg_note.setting_notifications_lesson_day = True
        await callback.answer(
            text="Теперь будут приходить уведомления о занятии за сутки"
        )
    await tg_note.asave()
    await generate_settings_message(callback=callback)


async def settings_switch_notifications_lessons_hour(callback: CallbackQuery):
    tg_note = await Telegram.objects.aget(tg_id=callback.from_user.id)
    if tg_note.setting_notifications_lessons_hour:
        tg_note.setting_notifications_lessons_hour = False
        await callback.answer(
            text="Уведомлений о занятии за час больше не будет"
        )
    else:
        tg_note.setting_notifications_lessons_hour = True
        await callback.answer(
            text="Теперь будут приходить уведомления о занятии за час"
        )
    await tg_note.asave()
    await generate_settings_message(callback=callback)


async def settings_switch_notifications_tg_connecting(callback: CallbackQuery):
    tg_note = await Telegram.objects.aget(tg_id=callback.from_user.id)
    if tg_note.setting_notifications_tg_connecting:
        tg_note.setting_notifications_tg_connecting = False
        await callback.answer(
            text="Уведомлений о привязке Telegram больше не будет"
        )
    else:
        tg_note.setting_notifications_tg_connecting = True
        await callback.answer(
            text="Теперь будут приходить уведомления о привязке Telegram"
        )
    await tg_note.asave()
    await generate_settings_message(callback=callback)


async def settings_switch_notifications_email(callback: CallbackQuery):
    tg_note = await Telegram.objects.select_related(
        "user").aget(tg_id=callback.from_user.id)
    if tg_note.user.setting_notifications_email:
        tg_note.user.setting_notifications_email = False
        await callback.answer(
            text="Уведомления больше не будут приходить на email"
        )
    else:
        tg_note.user.setting_notifications_email = True
        await callback.answer(
            text="Уведомления теперь будут приходить на email"
        )
    await tg_note.user.asave()
    await generate_settings_message(callback=callback)


async def settings_switch_lesson_review(callback: CallbackQuery):
    tg_note = await Telegram.objects.select_related(
        "user").aget(tg_id=callback.from_user.id)
    if tg_note.setting_lesson_review_form_mode == 0:
        tg_note.setting_lesson_review_form_mode = 1
        await callback.answer(
            text="Теперь форма ревью занятия будет в виде чата"
        )
    else:
        tg_note.setting_lesson_review_form_mode = 0
        await callback.answer(
            text="Теперь форма ревью занятия будет в окне мини-браузера"
        )
    await tg_note.asave()
    await generate_settings_message(callback=callback)


async def settings_set_timezone_message(callback: CallbackQuery):
    tg_note = await Telegram.objects.select_related(
        "user").aget(tg_id=callback.from_user.id)
    await callback.message.edit_text(
        text="От часового пояса зависит время уведомлений\n"
             "Выберите Ваш часовой пояс",
        reply_markup=get_settings_timezone_keyboard(tg_note.user.tz)
    )


async def settings_set_timezone(callback: CallbackQuery, new_timezone: int):
    tg_note = await Telegram.objects.select_related(
        "user").aget(tg_id=callback.from_user.id)
    tg_note.user.tz = new_timezone
    await tg_note.user.asave()
    await generate_settings_message(callback=callback)
