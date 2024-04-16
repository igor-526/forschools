from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from tgbot.keyboards.callbacks.homework import HomeworkCallback, HomeworkLogCallback


def get_homeworks_buttons(homeworks: list) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
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
