from aiogram import Router
from aiogram.types import CallbackQuery

from tgbot.funcs.multiuser import f_multiuser_change_user
from tgbot.keyboards.callbacks.multiuser import MultiUserCallback

router = Router(name=__name__)


@router.callback_query(MultiUserCallback.filter())
async def h_multiuser_change_user(callback: CallbackQuery,
                                  callback_data: MultiUserCallback) -> None:
    await f_multiuser_change_user(callback, callback_data.id)
