from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder
from tgbot.keyboards.callbacks.material import (MaterialCategoryCallback,
                                                MaterialTypeCallback,
                                                MaterialItemCallback,
                                                MaterialLevelCallback,
                                                MaterialItemSendTgCallback,
                                                MaterialListActionCallback,
                                                MaterialListUserNavigationCallback,
                                                MaterialListHomeworkNavigationCallback)


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


def get_keyboard_query_user(materials: list, user_id: int, current_page=1, next_button=False) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    adjust_grid = [1]
    for mat in materials:
        builder.button(
            text=mat.get("name"),
            callback_data=MaterialItemCallback(mat_id=mat.get("id"),
                                               action="show")
        )
        adjust_grid.append(1)
    if current_page > 1:
        builder.button(
            text="<",
            callback_data=MaterialListUserNavigationCallback(
                page=current_page-1,
                user_id=user_id
            )
        )
        adjust_grid[-1] += 1
    builder.button(
        text="X",
        callback_data=MaterialListActionCallback(action="delete")
    )
    if next_button:
        builder.button(
            text=">",
            callback_data=MaterialListUserNavigationCallback(
                page=current_page+1,
                user_id=user_id
            )
        )
        adjust_grid[-1] += 1
    builder.adjust(*adjust_grid)
    return builder.as_markup()


def get_keyboard_query_hw(materials: list, hw_id: int, current_page=1, next_button=False) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    adjust_grid = [1]
    for mat in materials:
        builder.button(
            text=mat.get("name"),
            callback_data=MaterialItemCallback(mat_id=mat.get("id"),
                                               action="show")
        )
        adjust_grid.append(1)
    if current_page > 1:
        builder.button(
            text="<",
            callback_data=MaterialListHomeworkNavigationCallback(
                page=current_page-1,
                hw_id=hw_id
            )
        )
        adjust_grid[-1] += 1
    builder.button(
        text="X",
        callback_data=MaterialListActionCallback(action="delete")
    )
    if next_button:
        builder.button(
            text=">",
            callback_data=MaterialListHomeworkNavigationCallback(
                page=current_page+1,
                hw_id=hw_id
            )
        )
        adjust_grid[-1] += 1
    builder.adjust(*adjust_grid)
    return builder.as_markup()


def get_keyboard_query(materials) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for mat in materials:
        builder.button(
            text=mat.name,
            callback_data=MaterialItemCallback(mat_id=mat.id,
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
