from aiogram import types, Router, F
from aiogram.types import CallbackQuery
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from tgbot.finite_states.materials import MaterialFSM
from tgbot.keyboards.callbacks.material import (MaterialCategoryCallback,
                                                MaterialTypeCallback,
                                                MaterialLevelCallback,
                                                MaterialItemCallback,
                                                MaterialItemSendTgCallback)
from tgbot.funcs.materials import (send_types,
                                   send_material_query,
                                   show_material_item,
                                   send_levels,
                                   add_material_message,
                                   send_tg_users,
                                   send_material_item, send_material_to_tg)
from tgbot.funcs.menu import send_menu

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
