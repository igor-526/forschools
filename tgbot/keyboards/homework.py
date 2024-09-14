from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from tgbot.keyboards.callbacks.homework import (HomeworkCallback, HomeworkLogCallback, HomeworkMenuCallback,
                                                HomeworkNewCallback, HomeworkNewSettingCallback)


def get_homework_menu_buttons() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text=f"Проверка домашних заданий",
        callback_data=HomeworkMenuCallback(action="show")
    )
    builder.button(
        text=f"Задать новое ДЗ",
        callback_data=HomeworkMenuCallback(action="new")
    )
    builder.adjust(1)
    return builder.as_markup()


def get_homework_newhwsetting_buttons(name, description, deadline, matcount) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text=f"Наименование: {name}",
        callback_data=HomeworkNewSettingCallback(action="name")
    )
    builder.button(
        text=f"Описание: {description}",
        callback_data=HomeworkNewSettingCallback(action="description")
    )
    builder.button(
        text=f"Срок: {deadline}",
        callback_data=HomeworkNewSettingCallback(action="deadline")
    )
    builder.button(
        text=f"Удалить материалы ({matcount})",
        callback_data=HomeworkNewSettingCallback(action="materials")
    )
    builder.adjust(1)
    return builder.as_markup()


def get_homework_listeners_buttons(listeners: list) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for listener in listeners:
        builder.button(
            text=listener.get('name'),
            callback_data=HomeworkNewCallback(user_id=listener.get('id'))
        )
    builder.adjust(1)
    return builder.as_markup()



def get_homeworks_buttons(homeworks: list, sb=False) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    if sb:
        builder.button(
            text="Поиск по ученику",
            callback_data=HomeworkCallback(action="search",
                                           hw_id=0)
        )
    for hw in homeworks:
        builder.button(
            text=f"ДЗ: {hw.name}",
            callback_data=HomeworkCallback(hw_id=hw.id,
                                           action="show")
        )
    builder.adjust(1)
    return builder.as_markup()


def get_homework_item_buttons(hw_id, can_send=False, can_check=False, materials=0) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="История",
        callback_data=HomeworkCallback(
            hw_id=hw_id,
            action="logs")
    )
    if materials > 0:
        builder.button(
            text=f"Материалы ({materials})",
            callback_data=HomeworkCallback(
                hw_id=hw_id,
                action="materials")
        )
    if can_send:
        builder.button(
            text="Отправить решение",
            callback_data=HomeworkCallback(
                hw_id=hw_id,
                action="send"
            )
        )
    if can_check:
        builder.button(
            text="Принять",
            callback_data=HomeworkCallback(
                hw_id=hw_id,
                action="check_accept"
            )
        )
        builder.button(
            text="Отправить на доработку",
            callback_data=HomeworkCallback(
                hw_id=hw_id,
                action="check_revision"
            )
        )
    builder.adjust(1)
    return builder.as_markup()


def get_hwlogs_buttons(hwlogs: list[dict]) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for hwlog in hwlogs:
        log_dt = hwlog.get("dt")
        log_status = hwlog.get("status")
        log_id = hwlog.get("id")
        builder.button(
            text=f"{log_dt} - {log_status}",
            callback_data=HomeworkLogCallback(log_id=log_id)
        )
    builder.adjust(1)
    return builder.as_markup()
