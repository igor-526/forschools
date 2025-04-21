from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from tgbot.keyboards.callbacks.settings import SettingsCallback, SetTimezoneCallback


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

    def set_lesson_review_mode_button():
        review_mode = settings.get("lesson_review_mode")
        if review_mode is None:
            return None
        text = "Режим ревью занятия: "
        if review_mode == 0:
            text += "WEB APP"
        elif review_mode == 1:
            text += "TG"
        builder.button(
            text=text,
            callback_data=SettingsCallback(action="set_lesson_review")
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

    def set_notifications_lessons_email():
        if settings.get("notifications_lessons_email") is None:
            return None
        if settings.get("notifications_lessons_email"):
            text = "\u2705 "
        else:
            text = "\u274C "
        text += "Уведомления на email"
        builder.button(
            text=text,
            callback_data=SettingsCallback(action="notifications_lessons_email")
        )

    def set_timezone_setting_button():
        if settings.get("timezone") is None:
            return None
        text = "Часовой пояс: "
        text += f'+{settings.get("timezone")}' if settings.get("timezone") > 0 else str(settings.get("timezone"))
        builder.button(
            text=text,
            callback_data=SettingsCallback(action="set_timezone")
        )

    def set_cancel_button():
        builder.button(
            text="Отмена",
            callback_data=SettingsCallback(action="cancel")
        )

    builder = InlineKeyboardBuilder()
    set_show_hw_materials_action()
    set_lesson_review_mode_button()
    set_notifications_lesson_day()
    set_notifications_lessons_hour()
    set_notifications_tg_connecting()
    set_notifications_lessons_email()
    set_timezone_setting_button()
    set_cancel_button()
    builder.adjust(1)
    return builder.as_markup()


def get_settings_timezone_keyboard(current: int = None) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for tz in range(-12, 15):
        if current == tz:
            text = "\u2705 "
        else:
            text = ""
        text += str(tz) if tz <= 0 else f"+{tz}"
        builder.button(
            text=text,
            callback_data=SetTimezoneCallback(new_tz=tz)
        )
    builder.button(
        text="Отмена",
        callback_data=SetTimezoneCallback(new_tz="cancel")
    )
    builder.adjust(4)
    return builder.as_markup()
