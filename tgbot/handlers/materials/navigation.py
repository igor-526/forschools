from aiogram import types, Router, F
from aiogram.types import CallbackQuery
from aiogram.fsm.context import FSMContext
from tgbot.keyboards.callbacks.material import (MaterialListUserNavigationCallback,
                                                MaterialListHomeworkNavigationCallback,
                                                MaterialListActionCallback)
from tgbot.funcs.materials import navigate_user_materials, get_hw_materials

router = Router(name=__name__)


@router.callback_query(MaterialListUserNavigationCallback.filter())
async def h_material_navigation_user_callback(callback: CallbackQuery,
                                              callback_data: MaterialListUserNavigationCallback,
                                              state: FSMContext) -> None:
    await navigate_user_materials(callback, state, callback_data.user_id, callback_data.page)


@router.callback_query(MaterialListHomeworkNavigationCallback.filter())
async def h_material_navigation_hw_callback(callback: CallbackQuery,
                                            callback_data: MaterialListHomeworkNavigationCallback,
                                            state: FSMContext) -> None:
    await get_hw_materials(callback, state, callback_data.hw_id, callback_data.page, True)


@router.callback_query(MaterialListActionCallback.filter(F.action == 'delete'))
async def h_material_navigation_delete_callback(callback: CallbackQuery) -> None:
    await callback.message.delete()
