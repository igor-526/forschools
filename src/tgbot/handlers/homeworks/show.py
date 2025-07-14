from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery

from tgbot.funcs.homeworks.homework_show import TGHomework
from tgbot.funcs.homeworks.homeworks import hw_send
from tgbot.keyboards.callbacks.homework import HomeworkCallback

router = Router(name=__name__)


@router.callback_query(HomeworkCallback.filter(F.action == 'show'))
async def h_homework_show_hw(callback: CallbackQuery,
                             callback_data: HomeworkCallback,
                             state: FSMContext) -> None:
    state_data = await state.get_data()
    if state_data.get('materials_action') == 'send_hw':
        await state.update_data({'action': 'send',
                                 'hw_id': callback_data.hw_id})
        await hw_send(callback.from_user.id, state)
    else:
        hw = TGHomework(homework_id=callback_data.hw_id,
                        telegram_id=callback.from_user.id)
        await hw.ainit_homework()
        await hw.show_homework()


@router.callback_query(HomeworkCallback.filter(F.action == 'materials'))
async def h_homework_show_materials(callback: CallbackQuery,
                                    callback_data: HomeworkCallback) -> None:
    hw = TGHomework(homework_id=callback_data.hw_id,
                    telegram_id=callback.from_user.id)
    await hw.ainit_homework()
    await hw.send_materials()
