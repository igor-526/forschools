from aiogram import Router, F, types
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from homework.models import Homework
from tgbot.finite_states.homework import HomeworkNewFSM, HomeworkAgreementFSM
from tgbot.funcs.homeworks import add_homework_select_lesson, add_homework_set_homework_message, \
    add_homework_delete_materials, add_homework_set_homework_change_ready, add_homework_set_homework_ready
from tgbot.funcs.homeworks_agreement import f_homework_agr_message, f_homework_agr_send, f_homework_agr_add_comment
from tgbot.funcs.materials_add import add_material_add
from tgbot.funcs.menu import send_menu
from tgbot.keyboards.callbacks.homework import HomeworkMenuCallback, HomeworkNewCallback, HomeworkNewSettingCallback, \
    HomeworkCallback, HomeworkNewSelectDateCallback

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
