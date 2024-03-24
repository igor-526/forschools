from aiogram import types, Router, F
from aiogram.types import CallbackQuery
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from tgbot.finite_states.materials import MaterialFSM
from tgbot.keyboards.callbacks.material import (MaterialCategoryCallback,
                                                MaterialTypeCallback,
                                                MaterialItemCallback)
from tgbot.funcs.materials import send_types, send_material_query, show_material_item
from tgbot.funcs.menu import send_menu

router = Router(name=__name__)


@router.message(StateFilter(MaterialFSM.material_add), F.text == "Отмена")
async def h_material_add_cancel(message: types.Message, state: FSMContext) -> None:
    await send_menu(message, state)

