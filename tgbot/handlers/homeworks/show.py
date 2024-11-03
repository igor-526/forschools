from aiogram import Router, F
from aiogram.types import CallbackQuery

from homework.models import Homework
from tgbot.funcs.homeworks import (show_homework, show_logs,
                                   show_log_item, send_hw_materials)
from tgbot.keyboards.callbacks.homework import HomeworkCallback, HomeworkLogCallback

router = Router(name=__name__)


@router.callback_query(HomeworkCallback.filter(F.action == 'show'))
async def h_homework_show_hw(callback: CallbackQuery,
                             callback_data: HomeworkCallback) -> None:
    await show_homework(callback, callback_data)


@router.callback_query(HomeworkCallback.filter(F.action == 'logs'))
async def h_homework_show_hw_logs(callback: CallbackQuery,
                                  callback_data: HomeworkCallback) -> None:
    await show_logs(callback, callback_data)


@router.callback_query(HomeworkCallback.filter(F.action == 'materials'))
async def h_homework_show_materials(callback: CallbackQuery,
                                    callback_data: HomeworkCallback) -> None:
    hw = await (Homework.objects.select_related("listener")
                .select_related("teacher")
                .aget(pk=callback_data.hw_id))
    await send_hw_materials(hw, callback, True)


@router.callback_query(HomeworkLogCallback.filter())
async def h_homework_show_hw_log_item(callback: CallbackQuery,
                                      callback_data: HomeworkLogCallback) -> None:
    await show_log_item(callback, callback_data.log_id)
