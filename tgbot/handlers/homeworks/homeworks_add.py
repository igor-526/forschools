from aiogram import Router, F, types
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery

from tgbot.create_bot import bot
from tgbot.finite_states.homework import HomeworkNewFSM
from tgbot.funcs.homeworks import add_homework_select_listener, add_homework_set_homework_message, \
    add_homework_set_homework_change, add_homework_set_homework_change_ready, add_homework_set_homework_ready
from tgbot.funcs.materials_add import add_material_add
from tgbot.funcs.menu import send_menu
from tgbot.keyboards.callbacks.homework import HomeworkMenuCallback, HomeworkNewCallback, HomeworkNewSettingCallback

router = Router(name=__name__)


@router.message(StateFilter(HomeworkNewFSM.change_menu),
                F.text == "Готово")
async def h_homework_sethw_ready(message: types.Message, state: FSMContext) -> None:
    statedata = await state.get_data()
    messages_to_delete = statedata.get("messages_to_delete")
    messages_to_delete.append(message.message_id)
    await state.update_data({"messages_to_delete": messages_to_delete})
    await add_homework_set_homework_ready(message, state)
    await send_menu(message.from_user.id, state)


@router.message(StateFilter(HomeworkNewFSM.change_menu),
                F.text == "Отмена")
async def h_homework_sethw_cancel(message: types.Message, state: FSMContext) -> None:
    statedata = await state.get_data()
    await message.delete()
    await send_menu(message.from_user.id, state)


@router.message(StateFilter(HomeworkNewFSM.change_menu))
async def h_homework_sethw_addmat(message: types.Message, state: FSMContext) -> None:
    await add_material_add(message, state, "statehw")


@router.callback_query(HomeworkNewSettingCallback.filter())
async def h_homework_add(callback: CallbackQuery,
                         callback_data: HomeworkNewSettingCallback,
                         state: FSMContext) -> None:
    await add_homework_set_homework_change(callback, state, callback_data.action)


@router.callback_query(HomeworkMenuCallback.filter(F.action == 'new'))
async def h_homework_add(callback: CallbackQuery,
                         state: FSMContext) -> None:
    await callback.message.delete()
    await add_homework_select_listener(callback.from_user.id)


@router.callback_query(HomeworkNewCallback.filter())
async def h_homework_sethw(callback: CallbackQuery,
                           callback_data: HomeworkNewCallback,
                           state: FSMContext) -> None:
    await add_homework_set_homework_message(callback.from_user.id, state, callback_data.user_id)
    await callback.message.delete()


@router.message(StateFilter(HomeworkNewFSM.change_name,
                            HomeworkNewFSM.change_description,
                            HomeworkNewFSM.change_deadline,
                            HomeworkNewFSM.delete_materials),
                F.text == "Отмена")
async def h_homework_sethw_cancel(message: types.Message, state: FSMContext) -> None:
    statedata = await state.get_data()
    messages_to_delete = statedata.get("messages_to_delete")
    messages_to_delete.append(message.message_id)
    await state.update_data({"messages_to_delete": messages_to_delete})
    await add_homework_set_homework_message(message.from_user.id, state, statedata.get("new_hw").get("listener_id"))


@router.message(StateFilter(HomeworkNewFSM.change_name))
async def h_homework_sethw_name(message: types.Message, state: FSMContext) -> None:
    statedata = await state.get_data()
    messages_to_delete = statedata.get("messages_to_delete")
    messages_to_delete.append(message.message_id)
    await state.update_data({"messages_to_delete": messages_to_delete})
    await add_homework_set_homework_change_ready(message, state, "name")


@router.message(StateFilter(HomeworkNewFSM.change_description))
async def h_homework_sethw_description(message: types.Message, state: FSMContext) -> None:
    statedata = await state.get_data()
    messages_to_delete = statedata.get("messages_to_delete")
    messages_to_delete.append(message.message_id)
    await state.update_data({"messages_to_delete": messages_to_delete})
    await add_homework_set_homework_change_ready(message, state, "description")


@router.message(StateFilter(HomeworkNewFSM.change_deadline))
async def h_homework_sethw_deadline(message: types.Message, state: FSMContext) -> None:
    statedata = await state.get_data()
    messages_to_delete = statedata.get("messages_to_delete")
    messages_to_delete.append(message.message_id)
    await state.update_data({"messages_to_delete": messages_to_delete})
    await add_homework_set_homework_change_ready(message, state, "deadline")


@router.message(StateFilter(HomeworkNewFSM.delete_materials),
                F.text == "Да")
async def h_homework_sethw_materials(message: types.Message, state: FSMContext) -> None:
    statedata = await state.get_data()
    messages_to_delete = statedata.get("messages_to_delete")
    messages_to_delete.append(message.message_id)
    await state.update_data({"messages_to_delete": messages_to_delete})
    await add_homework_set_homework_change_ready(message, state, "materials")


@router.message(StateFilter(HomeworkNewFSM.delete_materials))
async def h_homework_sethw_materials_invalid(message: types.Message, state: FSMContext) -> None:
    await message.answer("Пожалуйста, выберите вариант ответа на клавиатуре")
    statedata = await state.get_data()
    messages_to_delete = statedata.get("messages_to_delete")
    messages_to_delete.append(message.message_id)
    await state.update_data({"messages_to_delete": messages_to_delete})

