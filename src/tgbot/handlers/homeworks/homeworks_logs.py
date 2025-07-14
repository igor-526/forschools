from aiogram import F, Router, types
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery

from homework.models import HomeworkLog

from tgbot.finite_states.homework import HomeworkLogFSM
from tgbot.funcs.homeworks.homework_logs import (
    f_homework_logs_change_log_message,
    f_homework_logs_change_log_ready)
from tgbot.funcs.materials_add import FileParser
from tgbot.funcs.menu import send_menu
from tgbot.keyboards.callbacks.homework import HomeworkLogEditingCallback
from tgbot.keyboards.default import ready_cancel_keyboard

router = Router(name=__name__)


@router.callback_query(HomeworkLogEditingCallback.filter(
    F.action == "feedback_change"))
async def h_homework_log_edit_text(callback: CallbackQuery,
                                   callback_data: HomeworkLogEditingCallback,
                                   state: FSMContext) -> None:
    await f_homework_logs_change_log_message(callback, state,
                                             callback_data.hw_log_id)


@router.message(StateFilter(HomeworkLogFSM.edit_log),
                F.text == "Отмена")
async def h_homework_log_cancel(message: types.Message,
                                state: FSMContext) -> None:
    await send_menu(message.from_user.id, state)


@router.message(StateFilter(HomeworkLogFSM.edit_log),
                F.text == "Готово")
async def h_homework_log_ready(message: types.Message,
                               state: FSMContext) -> None:
    await f_homework_logs_change_log_ready(message, state)
    await send_menu(message.from_user.id, state)


@router.message(StateFilter(HomeworkLogFSM.edit_log),
                F.media_group_id != None)
async def h_homework_log_keep_media_group(message: types.Message,
                                          state: FSMContext,
                                          media_events=[]):
    files_list = []
    comments_list = []
    for media_event in media_events:
        file = FileParser(
            message=media_event,
            mode="file",
            success_text="Файл успешно прикреплён к ОС!",
            reply_markup=ready_cancel_keyboard,
            add_time_stamp=False,
            ignore_text=True
        )
        await file.download()
        if file.ready_file:
            files_list.append(file.ready_file.id)
        if file.file_description:
            comments_list.append(file.file_description)
    state_data = await state.get_data()
    state_data["files"].extend(files_list)
    state_data["comment"].extend(comments_list)
    await state.set_data(state_data)


@router.message(StateFilter(HomeworkLogFSM.edit_log))
async def h_homework_log_keep_files(message: types.Message,
                                    state: FSMContext) -> None:
    messages = [message]
    if message.reply_to_message:
        messages.append(message.reply_to_message)
    for m in messages:
        file = FileParser(
            message=m,
            mode="file",
            success_text="Файл успешно прикреплён к ОС!",
            reply_markup=ready_cancel_keyboard,
            add_time_stamp=False,
            ignore_text=True
        )
        await file.download()
        state_data = await state.get_data()
        if file.ready_file:
            state_data["files"].append(file.ready_file.id)
        if file.file_description:
            state_data["comment"].append(file.file_description)
        await state.set_data(state_data)


@router.callback_query(HomeworkLogEditingCallback.filter(
    F.action == "feedback_delete_file"))
async def h_homework_log_delete_file(
        callback: CallbackQuery,
        callback_data: HomeworkLogEditingCallback
) -> None:
    try:
        hw_log = await HomeworkLog.objects.aget(pk=callback_data.hw_log_id)
    except HomeworkLog.DoesNotExist:
        await callback.answer("Ошибка. Лога ДЗ не найдено")
        await callback.message.delete()
        return
    await hw_log.files.aset([file.id async for file in
                             hw_log.files.exclude(id=callback_data.file_id)])
    await callback.answer("Файла больше нет в ОС")
    await callback.message.delete()


@router.callback_query(HomeworkLogEditingCallback.filter(
    F.action == "feedback_delete"))
async def h_homework_log_delete(
        callback: CallbackQuery,
        callback_data: HomeworkLogEditingCallback
) -> None:
    try:
        hw_log = await HomeworkLog.objects.aget(pk=callback_data.hw_log_id)
    except HomeworkLog.DoesNotExist:
        await callback.answer("Ошибка. Лога ДЗ не найдено")
        await callback.message.delete()
        return
    await hw_log.adelete()
    await callback.answer("ОС удалена")
    await callback.message.delete()
