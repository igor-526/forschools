from aiogram.types import InlineKeyboardMarkup, KeyboardButton, ReplyKeyboardMarkup, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder
from tgbot.keyboards.callbacks.homework import (HomeworkCallback, HomeworkLogCallback, HomeworkMenuCallback,
                                                HomeworkNewCallback, HomeworkNewSettingCallback,
                                                HomeworkNewSelectDateCallback, HomeworkCuratorCallback)
from tgbot.keyboards.utils import keyboard_anti_cache_url


def get_homework_menu_buttons(params: dict) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    if params.get("check_hw_btn"):
        builder.button(
            text=f"Проверка домашних заданий",
            callback_data=HomeworkMenuCallback(action="check")
        )
    if params.get("new_hw_btn"):
        builder.button(
            text=f"Задать новое ДЗ",
            callback_data=HomeworkMenuCallback(action="new")
        )
    if params.get("compl_hw_btn"):
        builder.button(
            text=f"Выполнить ДЗ",
            callback_data=HomeworkMenuCallback(action="complete")
        )
    builder.adjust(1)
    return builder.as_markup()


def get_homework_editing_buttons() -> ReplyKeyboardMarkup:
    cancel_button = KeyboardButton(text="Отмена")
    edit_materials_button = KeyboardButton(text=f"Показать прик. материалы")
    save_hw_button = KeyboardButton(text="Подтвердить ДЗ")
    return ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[save_hw_button],
                                                               [edit_materials_button],
                                                               [cancel_button]])


def get_homework_lessons_buttons(lessons: list, prev_date=None, next_date=None) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for lsn in lessons:
        btn_text = f'{("("+"X"+")") if lsn.get("status") == 0 else ""} {lsn.get("start_time")}-{lsn.get("end_time")}: {", ".join([l.first_name+" "+l.last_name for l in lsn.get("listeners")])}'
        builder.button(
            text=btn_text,
            callback_data=HomeworkNewCallback(lesson_id=lsn.get('lesson_id'))
        )
    last_row_counter = 0
    if prev_date:
        builder.button(
            text=f"<< {prev_date.get('string')}",
            callback_data=HomeworkNewSelectDateCallback(date=prev_date.get('callback'))
        )
        last_row_counter += 1
    if next_date:
        builder.button(
            text=f"{next_date.get('string')} >>",
            callback_data=HomeworkNewSelectDateCallback(date=next_date.get('callback'))
        )
        last_row_counter += 1
    sizes = [1 for l in lessons]
    if last_row_counter:
        sizes.append(last_row_counter)
    builder.adjust(*sizes)
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
        hw_name = "(\u2714) " if hw.get('status') else ""
        hw_name += f"{hw.get('name')}"
        builder.button(
            text=hw_name,
            callback_data=HomeworkCallback(hw_id=hw.get('id'),
                                           action="show")
        )
    builder.adjust(1)
    return builder.as_markup()


def get_homework_item_buttons(hw_id,
                              mat_button,
                              send_button,
                              check_button,
                              last_logs_button,
                              agreement_buttons) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text="ПРОСМОТР",
        web_app=WebAppInfo(
            url=keyboard_anti_cache_url(f"https://kitai-school.forschools.ru/ma/homeworks/{hw_id}/"))
    )
    if mat_button:
        builder.button(
            text=f"Показать материалы",
            callback_data=HomeworkCallback(
                hw_id=hw_id,
                action="materials")
        )
    if last_logs_button:
        builder.button(
            text="Последний ответ",
            callback_data=HomeworkCallback(
                hw_id=hw_id,
                action="logs")
        )
    if send_button:
        builder.button(
            text="Отправить решение",
            callback_data=HomeworkCallback(
                hw_id=hw_id,
                action="send"
            )
        )
    if check_button:
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
    if agreement_buttons:
        builder.button(
            text="Согласовать",
            callback_data=HomeworkCallback(
                hw_id=hw_id,
                action="agreement_accept"
            )
        )
        builder.button(
            text="Сообщение преподавателю",
            callback_data=HomeworkCallback(
                hw_id=hw_id,
                action="agreement_decline"
            )
        )
    builder.adjust(1)
    return builder.as_markup()


def get_hwlogs_buttons(hwlogs: list[dict], dt_info: bool = True) -> InlineKeyboardMarkup:
    def set_button(hw_log):
        log_dt = hw_log.get("dt")
        log_status = hw_log.get("status")
        log_id = hw_log.get("id")
        if dt_info:
            btn_text = f"{log_dt} - {log_status}"
        else:
            btn_text = log_status
        builder.button(
            text=btn_text,
            callback_data=HomeworkLogCallback(log_id=log_id)
        )

    builder = InlineKeyboardBuilder()
    for hwlog in hwlogs:
        set_button(hwlog)
    builder.adjust(1)
    return builder.as_markup()


def get_homework_edit_button(hw_id) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(
        text=f"Редактировать",
        callback_data=HomeworkCallback(hw_id=hw_id,
                                       action="edit")
    )
    builder.adjust(1)
    return builder.as_markup()


def get_homework_agreement_buttons(action="accept") -> ReplyKeyboardMarkup | None:
    cancel_button = KeyboardButton(text="Отмена")
    accept_button = KeyboardButton(text=f"Согласовать")
    decline_button = KeyboardButton(text="Отправить на корректировку")
    if action == "accept":
        return ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[accept_button],
                                                                   [cancel_button]])
    elif action == "decline":
        return ReplyKeyboardMarkup(resize_keyboard=True, keyboard=[[decline_button],
                                                                   [cancel_button]])
    else:
        return None


def get_homework_curator_button(hw_id: int, for_curator_status=True) -> InlineKeyboardMarkup:
    btn_text = "\u2705" if for_curator_status else "\u274C"
    btn_text += " кураторы работают с ДЗ"
    builder = InlineKeyboardBuilder()
    builder.button(
        text=btn_text,
        callback_data=HomeworkCuratorCallback(hw_id=hw_id)
    )
    builder.adjust(1)
    return builder.as_markup()


def get_homework_add_ready_buttons(hw_id: int = None,
                                   lesson_id: int = None,
                                   for_curator_status: bool = None) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    if hw_id:
        builder.button(
            text="Домашнее задание",
            web_app=WebAppInfo(url=keyboard_anti_cache_url(f"https://kitai-school.forschools.ru/ma/homeworks/{hw_id}/"))
        )
    if lesson_id:
        builder.button(
            text="ФОРМА ЗАНЯТИЯ",
            web_app=WebAppInfo(url=keyboard_anti_cache_url(f"https://kitai-school.forschools.ru/ma/lessons/{lesson_id}/form/"))
        )
    if for_curator_status is not None:
        btn_curator_text = "\u2705" if for_curator_status else "\u274C"
        btn_curator_text += " кураторы работают с ДЗ"
        builder.button(
            text=btn_curator_text,
            callback_data=HomeworkCuratorCallback(hw_id=hw_id)
        )
    builder.adjust(1)
    return builder.as_markup()
