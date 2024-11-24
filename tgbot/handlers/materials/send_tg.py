from aiogram import Router, F
from aiogram.types import CallbackQuery
from aiogram.fsm.context import FSMContext
from tgbot.keyboards.callbacks.material import (MaterialItemCallback,
                                                MaterialItemSendTgCallback)
from tgbot.funcs.materials import send_tg_users, send_material_to_tg

router = Router(name=__name__)


@router.callback_query(MaterialItemCallback.filter(F.action == 'send_tg'))
async def h_material_send_tg_callback(callback: CallbackQuery,
                                      callback_data: MaterialItemCallback,
                                      state: FSMContext) -> None:
    await send_tg_users(callback, state, callback_data.mat_id)


@router.callback_query(MaterialItemSendTgCallback.filter())
async def h_material_send_tg_callback(callback: CallbackQuery,
                                      callback_data: MaterialItemSendTgCallback,
                                      state: FSMContext) -> None:
    await send_material_to_tg(callback, callback_data)
