from aiogram import types
from aiogram.fsm.context import FSMContext
from tgbot.finite_states.menu import MenuFSM
from tgbot.keyboards import menu_keyboard


async def send_menu(message: types.Message, state: FSMContext) -> None:
    await message.answer(text="Выберите действие: ", reply_markup=menu_keyboard)
    await state.set_state(MenuFSM.main_menu)
