from aiogram import types, Router, F
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from tgbot.finite_states.materials import MaterialFSM
from tgbot.funcs.materials_add import add_material_add
from tgbot.funcs.menu import send_menu

router = Router(name=__name__)


@router.message(StateFilter(MaterialFSM.material_add))
async def h_material_add_new(message: types.Message, state: FSMContext) -> None:
    await add_material_add(message, state)


@router.message(StateFilter(MaterialFSM.material_add), F.text == "Отмена")
async def h_material_add_cancel(message: types.Message, state: FSMContext) -> None:
    await send_menu(message.from_user.id, state)

