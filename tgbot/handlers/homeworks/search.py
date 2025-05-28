from aiogram import Router, F, types
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from tgbot.funcs.homeworks.homeworks import search_homeworks_message, search_homeworks_query, show_homework_queryset
from tgbot.funcs.menu import send_menu
from tgbot.keyboards.callbacks.homework import HomeworkCallback, HomeworkMenuCallback
from tgbot.finite_states.homework import HomeworkFSM

router = Router(name=__name__)


@router.callback_query(HomeworkMenuCallback.filter(F.action == 'complete'))
async def h_homework_show_complete(callback: CallbackQuery,
                          callback_data: HomeworkMenuCallback,
                          state: FSMContext) -> None:
    await callback.message.delete()
    await show_homework_queryset(callback.from_user.id, state, callback_data.action)


@router.callback_query(HomeworkMenuCallback.filter(F.action == 'check'))
async def h_homework_show_check(callback: CallbackQuery,
                                callback_data: HomeworkMenuCallback,
                                state: FSMContext) -> None:
    await callback.message.delete()
    await show_homework_queryset(callback.from_user.id, state, callback_data.action)


@router.callback_query(HomeworkCallback.filter(F.action == 'search'))
async def h_homework_search(callback: CallbackQuery,
                            state: FSMContext) -> None:
    await search_homeworks_message(callback, state)


@router.message(StateFilter(HomeworkFSM.search),
                F.text == "Отмена")
async def h_homework_search_cancel(message: types.Message, state: FSMContext) -> None:
    await send_menu(message.from_user.id, state)


@router.message(StateFilter(HomeworkFSM.search))
async def h_homework_search_query(message: types.Message) -> None:
    await search_homeworks_query(message)
