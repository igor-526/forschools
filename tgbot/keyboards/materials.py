from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from tgbot.keyboards.callbacks.material import (MaterialCategoryCallback,
                                                MaterialTypeCallback,
                                                MaterialItemCallback,
                                                MaterialLevelCallback,
                                                MaterialItemSendTgCallback)


def get_keyboard_materials(add_mat=False) -> ReplyKeyboardMarkup:
    add_button = KeyboardButton(text="Добавить")
    back_button = KeyboardButton(text="Меню")
    keyboard = []
    if add_mat:
        keyboard.append([add_button])
    keyboard.append([back_button])
    return ReplyKeyboardMarkup(resize_keyboard=True, keyboard=keyboard)


def get_keyboard_categories(cats: list) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="Все",
        callback_data=MaterialCategoryCallback(cat_id=0)
    )
    for cat in cats:
        builder.button(
            text=cat.name,
            callback_data=MaterialCategoryCallback(cat_id=cat.id)
        )
    builder.adjust(3)
    return builder.as_markup()


def get_keyboard_levels(levels: list) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="Все",
        callback_data=MaterialLevelCallback(lvl_id=0)
    )
    for lvl in levels:
        builder.button(
            text=lvl.name,
            callback_data=MaterialLevelCallback(lvl_id=lvl.id)
        )
    builder.adjust(3)
    return builder.as_markup()


def get_keyboard_types() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="Все",
        callback_data=MaterialTypeCallback(mat_type="all")
    )
    builder.button(
        text="PDF",
        callback_data=MaterialTypeCallback(mat_type="pdf_formats")
    )
    builder.button(
        text="Анимация",
        callback_data=MaterialTypeCallback(mat_type="animation_formats")
    )
    builder.button(
        text="Архив",
        callback_data=MaterialTypeCallback(mat_type="archive_formats")
    )
    builder.button(
        text="Видео",
        callback_data=MaterialTypeCallback(mat_type="video_formats")
    )
    builder.button(
        text="Изображение",
        callback_data=MaterialTypeCallback(mat_type="image_formats")
    )
    builder.adjust(3)
    return builder.as_markup()


def get_keyboard_query(materials: list) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for mat in materials:
        builder.button(
            text=mat.get("name"),
            callback_data=MaterialItemCallback(mat_id=mat.get("id"),
                                               action="show")
        )
    builder.adjust(1)
    return builder.as_markup()


def get_show_key(mat_id) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="Посмотреть",
        callback_data=MaterialItemCallback(mat_id=mat_id,
                                           action="show")
    )
    return builder.as_markup()


def get_keyboard_material_item(material, send_tg=False) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="В браузере",
        url="https://yandex.ru/"
    )
    if send_tg:
        builder.button(
            text="Отправить в TG",
            callback_data=MaterialItemCallback(mat_id=material.id,
                                               action="send_tg")
        )
    builder.adjust(1)
    return builder.as_markup()


def get_keyboard_tg_users(users, mat_id) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for user in users:
        builder.button(
            text=f'{user.user}',
            callback_data=MaterialItemSendTgCallback(mat_id=mat_id,
                                                     tg_id=user.tg_id)
        )
    builder.adjust(2)
    return builder.as_markup()
