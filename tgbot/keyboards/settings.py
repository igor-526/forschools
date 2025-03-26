from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from tgbot.keyboards.callbacks.settings import SettingsCallback


def get_settings_keyboard(settings: dict) -> InlineKeyboardMarkup:
    def set_show_hw_materials_action():
        if settings.get("show_hw_materials") is None:
            return None
        if settings.get("show_hw_materials"):
            text = "\u2705 "
        else:
            text = "\u274C "
        text += "Автом. показывать материалы в ДЗ"
        builder.button(
            text=text,
            callback_data=SettingsCallback(action="show_hw_materials")
        )

    def set_notifications_lesson_day():
        if settings.get("notifications_lesson_day") is None:
            return None
        if settings.get("notifications_lesson_day"):
            text = "\u2705 "
        else:
            text = "\u274C "
        text += "Напоминание о занятии за сутки"
        builder.button(
            text=text,
            callback_data=SettingsCallback(action="notifications_lesson_day")
        )

    def set_notifications_lessons_hour():
        if settings.get("notifications_lessons_hour") is None:
            return None
        if settings.get("notifications_lessons_hour"):
            text = "\u2705 "
        else:
            text = "\u274C "
        text += "Напоминание о занятии за час"
        builder.button(
            text=text,
            callback_data=SettingsCallback(action="notifications_lessons_hour")
        )

    def set_notifications_tg_connecting():
        if settings.get("notifications_tg_connecting") is None:
            return None
        if settings.get("notifications_tg_connecting"):
            text = "\u2705 "
        else:
            text = "\u274C "
        text += "Уведомление о привязке TG"
        builder.button(
            text=text,
            callback_data=SettingsCallback(action="notifications_tg_connecting")
        )

    def set_cancel_button():
        builder.button(
            text="Отмена",
            callback_data=SettingsCallback(action="cancel")
        )

    builder = InlineKeyboardBuilder()
    set_show_hw_materials_action()
    set_notifications_lesson_day()
    set_notifications_lessons_hour()
    set_notifications_tg_connecting()
    set_cancel_button()
    builder.adjust(1)
    return builder.as_markup()