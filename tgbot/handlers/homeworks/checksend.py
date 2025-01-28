from aiogram import Router, F, types
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from tgbot.funcs.homeworks import send_hw_check, send_hw_answer, hw_send
from tgbot.funcs.materials_add import FileParser
from tgbot.funcs.menu import send_menu
from tgbot.keyboards.callbacks.homework import HomeworkCallback
from tgbot.finite_states.homework import HomeworkFSM
from tgbot.keyboards.default import homework_typing_keyboard

router = Router(name=__name__)


@router.callback_query(HomeworkCallback.filter(F.action == 'send'))
async def h_homework_send_hw(callback: CallbackQuery,
                             callback_data: HomeworkCallback,
                             state: FSMContext) -> None:
    await send_hw_answer(callback, callback_data, state)


@router.callback_query(HomeworkCallback.filter(F.action == 'check_accept'))
@router.callback_query(HomeworkCallback.filter(F.action == 'check_revision'))
async def h_homework_check_hw(callback: CallbackQuery,
                              callback_data: HomeworkCallback,
                              state: FSMContext) -> None:
    await send_hw_check(callback, callback_data, state)


@router.message(StateFilter(HomeworkFSM.send_hw_files),
                F.text == "Отмена")
async def h_material_menu(message: types.Message, state: FSMContext) -> None:
    await send_menu(message.from_user.id, state)


@router.message(StateFilter(HomeworkFSM.send_hw_files),
                F.text == "Отправить")
async def h_homework_send_ready(message: types.Message, state: FSMContext) -> None:
    await hw_send(message.from_user.id, state)


@router.message(StateFilter(HomeworkFSM.send_hw_files),
                F.media_group_id != None)
async def h_homework_keep_media_group(message: types.Message, state: FSMContext, media_events=[]):
    files_list = []
    comments_list = []
    for media_event in media_events:
        file = FileParser(
            message=media_event,
            mode="file",
            success_text="Файл успешно прикреплён к ДЗ!",
            reply_markup=homework_typing_keyboard,
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


@router.message(StateFilter(HomeworkFSM.send_hw_files))
async def h_homework_keep_files(message: types.Message, state: FSMContext) -> None:
    messages = [message]
    if message.reply_to_message:
        messages.append(message.reply_to_message)
    for m in messages:
        file = FileParser(
            message=m,
            mode="file",
            success_text="Файл успешно прикреплён к ДЗ!",
            reply_markup=homework_typing_keyboard,
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
