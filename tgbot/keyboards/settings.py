from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from tgbot.keyboards.callbacks.settings import SettingsCallback


def get_settings_keyboard(settings: dict) -> InlineKeyboardMarkup:
    def set_show_hw_materials_action():
        if settings.get("show_hw_materials"):
            text = "\u2705 "
        else:
            text = "\u274C "
        text += "Автом. показывать материалы в ДЗ"
        builder.button(
            text=text,
            callback_data=SettingsCallback(action="show_hw_materials")
        )

    def set_cancel_button():
        builder.button(
            text="Отмена",
            callback_data=SettingsCallback(action="cancel")
        )

    builder = InlineKeyboardBuilder()
    set_show_hw_materials_action()
    set_cancel_button()
    builder.adjust(1)
    return builder.as_markup()
