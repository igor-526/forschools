from aiogram import types, Router, F
from aiogram.types import CallbackQuery
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from tgbot.finite_states.materials import MaterialFSM
from tgbot.keyboards.callbacks.material import (MaterialCategoryCallback,
                                                MaterialTypeCallback,
                                                MaterialLevelCallback,
                                                MaterialItemCallback)
from tgbot.funcs.materials import (send_types,
                                   send_material_query,
                                   show_material_item,
                                   send_levels,
                                   add_material_message,
                                   search_materials)
from tgbot.funcs.menu import send_menu

router = Router(name=__name__)


@router.message(StateFilter(MaterialFSM.material_search), F.text == "Добавить")
async def h_material_add(message: types.Message, state: FSMContext) -> None:
    await add_material_message(message, state)


@router.message(StateFilter(MaterialFSM.material_search), F.text == "Меню")
async def h_material_menu(message: types.Message, state: FSMContext) -> None:
    await send_menu(message.from_user.id, state)


@router.message(StateFilter(MaterialFSM.material_search))
async def h_material_search(message: types.Message, state: FSMContext) -> None:
    await search_materials(message, state)


@router.callback_query(MaterialCategoryCallback.filter())
async def h_material_category_callback(callback: CallbackQuery,
                                       callback_data: MaterialCategoryCallback,
                                       state: FSMContext) -> None:
    await state.update_data({"cat_id": callback_data.cat_id})
    await send_levels(callback)


@router.callback_query(MaterialLevelCallback.filter())
async def h_material_level_callback(callback: CallbackQuery,
                                    callback_data: MaterialLevelCallback,
                                    state: FSMContext) -> None:
    await state.update_data({"lvl_id": callback_data.lvl_id})
    await send_types(callback)


@router.callback_query(MaterialTypeCallback.filter())
async def h_material_type_callback(callback: CallbackQuery,
                                   callback_data: MaterialTypeCallback,
                                   state: FSMContext) -> None:
    await state.update_data({"mat_type": callback_data.mat_type})
    await send_material_query(callback, state)


@router.callback_query(MaterialItemCallback.filter(F.action == 'show'))
async def h_material_show_callback(callback: CallbackQuery,
                                   callback_data: MaterialItemCallback) -> None:
    await show_material_item(callback, callback_data)
