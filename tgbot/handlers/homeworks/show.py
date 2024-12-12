from aiogram import Router, F
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from homework.models import Homework
from tgbot.funcs.homeworks import show_homework, send_hw_materials
from tgbot.keyboards.callbacks.homework import HomeworkCallback

router = Router(name=__name__)


@router.callback_query(HomeworkCallback.filter(F.action == 'show'))
async def h_homework_show_hw(callback: CallbackQuery,
                             callback_data: HomeworkCallback,
                             state: FSMContext) -> None:
    await show_homework(callback, callback_data, state)


@router.callback_query(HomeworkCallback.filter(F.action == 'materials'))
async def h_homework_show_materials(callback: CallbackQuery,
                                    callback_data: HomeworkCallback,
                                    state: FSMContext) -> None:
    hw = await (Homework.objects.select_related("listener")
                .select_related("teacher")
                .aget(pk=callback_data.hw_id))
    await send_hw_materials([mat.id async for mat in hw.materials.all()], hw.id, callback.from_user.id,
                            callback, state, True)
