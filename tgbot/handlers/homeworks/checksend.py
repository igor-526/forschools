from aiogram import Router, F, types
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from tgbot.funcs.homeworks import (send_hw_check, send_hw_answer,
                                   add_files, hw_send_confirmation,
                                   hw_send)
from tgbot.funcs.menu import send_menu
from tgbot.keyboards.callbacks.homework import HomeworkCallback
from tgbot.finite_states.homework import HomeworkFSM

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


@router.message(StateFilter(HomeworkFSM.send_hw_files,
                            HomeworkFSM.send_hw_accept),
                F.text == "Отмена")
async def h_material_menu(message: types.Message, state: FSMContext) -> None:
    await send_menu(message, state)


@router.message(StateFilter(HomeworkFSM.send_hw_files),
                F.text == "Готово")
async def h_homework_send_ready(message: types.Message, state: FSMContext) -> None:
    await hw_send_confirmation(message, state)


@router.message(StateFilter(HomeworkFSM.send_hw_files))
async def h_homework_filekeeper(message: types.Message, state: FSMContext) -> None:
    await add_files(message, state)


@router.message(StateFilter(HomeworkFSM.send_hw_accept),
                F.text == "Да")
async def h_homework_send_ready_accepted(message: types.Message, state: FSMContext) -> None:
    await hw_send(message, state)
