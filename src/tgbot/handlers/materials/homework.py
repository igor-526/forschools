from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery

from tgbot.funcs.materials import delete_material_from_hw
from tgbot.keyboards.callbacks.material import MaterialItemCallback

router = Router(name=__name__)

@router.callback_query(MaterialItemCallback.filter(F.action == 'hw_delete'))
async def h_material_hw_delete_callback(callback: CallbackQuery,
                                        callback_data: MaterialItemCallback,
                                        state: FSMContext) -> None:
    await delete_material_from_hw(callback, callback_data, state)
