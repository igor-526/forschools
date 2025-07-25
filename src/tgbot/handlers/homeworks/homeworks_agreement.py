from aiogram import F, Router, types
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery

from tgbot.finite_states.homework import HomeworkAgreementFSM
from tgbot.funcs.homeworks.homeworks_agreement import (
    f_homework_agr_add_comment,
    f_homework_agr_message,
    f_homework_agr_send)
from tgbot.funcs.menu import send_menu
from tgbot.keyboards.callbacks.homework import HomeworkCallback

router = Router(name=__name__)


@router.callback_query(HomeworkCallback.filter(F.action == "agreement_accept"))
async def h_homework_agr_accept(callback: CallbackQuery,
                                callback_data: HomeworkCallback,
                                state: FSMContext) -> None:
    await state.set_data({
        "action": callback_data.action,
        "hw_id": callback_data.hw_id
    })
    await f_homework_agr_send(callback.from_user.id, state)


@router.callback_query(HomeworkCallback.filter(
    F.action == "agreement_decline"))
async def h_homework_agr_decline(callback: CallbackQuery,
                                 callback_data: HomeworkCallback,
                                 state: FSMContext) -> None:
    await f_homework_agr_message(callback, callback_data, state)


@router.message(StateFilter(HomeworkAgreementFSM.message),
                F.text == "Отмена")
async def h_homework_agr_cancel(message: types.Message,
                                state: FSMContext) -> None:
    await message.delete()
    await send_menu(message.from_user.id, state)


@router.message(StateFilter(HomeworkAgreementFSM.message),
                F.text == "Отправить на корректировку")
async def h_homework_agr_decline_send(message: types.Message,
                                      state: FSMContext) -> None:
    await message.delete()
    await f_homework_agr_send(message.from_user.id, state)


@router.message(StateFilter(HomeworkAgreementFSM.message),
                F.media_group_id != None)
async def h_homework_agr_comment_media_group(message: types.Message,
                                             state: FSMContext,
                                             media_events=[]):
    await f_homework_agr_add_comment(media_events, state)


@router.message(StateFilter(HomeworkAgreementFSM.message))
async def h_homework_agr_comment(message: types.Message,
                                 state: FSMContext) -> None:
    messages = [message]
    if message.reply_to_message:
        messages.append(message.reply_to_message)
    await f_homework_agr_add_comment(messages, state)
