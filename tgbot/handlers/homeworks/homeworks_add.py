from aiogram import Router, F, types
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from homework.models import Homework
from tgbot.finite_states.homework import HomeworkNewFSM
from tgbot.funcs.homeworks import (add_homework_select_lesson, add_homework_set_homework_message,
                                   add_homework_set_homework_ready, send_hw_materials)
from tgbot.funcs.materials_add import add_material_add
from tgbot.funcs.menu import send_menu
from tgbot.keyboards.callbacks.homework import HomeworkMenuCallback, HomeworkNewCallback, HomeworkNewSettingCallback, \
    HomeworkCallback, HomeworkNewSelectDateCallback

router = Router(name=__name__)


@router.callback_query(HomeworkCallback.filter(F.action == "edit"))     # Редактирование готового ДЗ кнопка
async def h_homework_edit(callback: CallbackQuery,
                          callback_data: HomeworkCallback,
                          state: FSMContext) -> None:
    hw = await Homework.objects.select_related("listener").aget(pk=callback_data.hw_id)
    await state.set_data({
        "new_hw": {
            "hw_id": hw.id,
            "listener_id": hw.listener.id,
            "name": hw.name,
            "description": hw.description,
            "materials": [m.id async for m in hw.materials.all()],
            "deadline": {
                'day': hw.deadline.day,
                'month': hw.deadline.month,
                'year': hw.deadline.year,
            },
        },
        "messages_to_delete": []
    })
    await add_homework_set_homework_message(callback.from_user.id, state)


@router.message(StateFilter(HomeworkNewFSM.change_menu),    # Подтверждение ДЗ
                F.text == "Подтвердить ДЗ")
async def h_homework_sethw_ready(message: types.Message, state: FSMContext) -> None:
    sd = await state.get_data()
    if sd.get("new_hw") and sd.get("new_hw").get("hw_id"):
        await add_homework_set_homework_ready(state=state,
                                              message=message)
    else:
        await add_homework_select_lesson(user_tg_id=message.from_user.id,
                                         message=message)


@router.message(StateFilter(HomeworkNewFSM.change_menu),
                F.text == "Отмена")
async def h_homework_sethw_cancel(message: types.Message, state: FSMContext) -> None:
    await message.delete()
    await send_menu(message.from_user.id, state)


@router.message(StateFilter(HomeworkNewFSM.change_menu),
                F.text == "Показать прик. материалы")
async def h_homework_sethw_materials(message: types.Message, state: FSMContext) -> None:
    sd = await state.get_data()
    if sd.get("new_hw") and sd.get("new_hw").get("materials"):
        await send_hw_materials(mat_ids=sd.get("new_hw").get("materials"),
                                hw_id=sd.get("new_hw").get("hw_id"),
                                user_id=message.from_user.id,
                                callback=None,
                                state=state,
                                meta=True,
                                del_hw_msg=False)
    else:
        await message.answer("Не прикреплено ни одного материала.\n"
                             "Для прикрепления просто отправьте или перешлите их мне")
        # async def send_hw_materials(mat_ids: list, hw_id: int | None, callback: CallbackQuery,
        #                             state: FSMContext, meta: bool, del_hw_msg=True):
    await message.delete()


@router.message(StateFilter(HomeworkNewFSM.change_menu))
async def h_homework_sethw_addmat(message: types.Message, state: FSMContext) -> None:
    await add_material_add(message, state, "statehw")


@router.callback_query(HomeworkNewCallback.filter())
async def h_homework_add(callback: CallbackQuery,
                         callback_data: HomeworkNewCallback,
                         state: FSMContext) -> None:
    state_data = await state.get_data()
    state_data['new_hw']['lesson_id'] = callback_data.lesson_id
    await state.update_data(state_data)
    await add_homework_set_homework_ready(state=state,
                                          callback=callback)


@router.callback_query(HomeworkNewSelectDateCallback.filter())
async def h_homework_add_navigate(callback: CallbackQuery,
                                  callback_data: HomeworkNewSelectDateCallback) -> None:
    await add_homework_select_lesson(user_tg_id=callback.from_user.id,
                                     callback=callback,
                                     date_=callback_data.date)


@router.callback_query(HomeworkMenuCallback.filter(F.action == 'new'))
async def h_homework_sethw(callback: CallbackQuery,
                           state: FSMContext) -> None:
    await add_homework_set_homework_message(callback.from_user.id, state)
    await callback.message.delete()

