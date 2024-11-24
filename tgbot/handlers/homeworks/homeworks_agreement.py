from aiogram import Router, F, types
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from tgbot.finite_states.homework import HomeworkAgreementFSM
from tgbot.funcs.homeworks_agreement import f_homework_agr_message, f_homework_agr_send, f_homework_agr_add_comment
from tgbot.funcs.menu import send_menu
from tgbot.keyboards.callbacks.homework import HomeworkCallback

router = Router(name=__name__)


@router.callback_query(HomeworkCallback.filter(F.action == "agreement_accept"))
async def h_homework_agr_accept(callback: CallbackQuery,
                                callback_data: HomeworkCallback,
                                state: FSMContext) -> None:
    await f_homework_agr_message(callback, callback_data, state)


@router.callback_query(HomeworkCallback.filter(F.action == "agreement_decline"))
async def h_homework_agr_decline(callback: CallbackQuery,
                                 callback_data: HomeworkCallback,
                                 state: FSMContext) -> None:
    await f_homework_agr_message(callback, callback_data, state)


@router.message(StateFilter(HomeworkAgreementFSM.message),
                F.text == "Отмена")
async def h_homework_agr_cancel(message: types.Message, state: FSMContext) -> None:
    await message.delete()
    await send_menu(message.from_user.id, state)


@router.message(StateFilter(HomeworkAgreementFSM.message),
                F.text == "Согласовать")
async def h_homework_agr_accept_send(message: types.Message, state: FSMContext) -> None:
    await message.delete()
    await f_homework_agr_send(message, state)


@router.message(StateFilter(HomeworkAgreementFSM.message),
                F.text == "Отправить на корректировку")
async def h_homework_agr_decline_send(message: types.Message, state: FSMContext) -> None:
    await message.delete()
    await f_homework_agr_send(message, state)


@router.message(StateFilter(HomeworkAgreementFSM.message))
async def h_homework_agr_comment(message: types.Message, state: FSMContext) -> None:
    await f_homework_agr_add_comment(message, state)
