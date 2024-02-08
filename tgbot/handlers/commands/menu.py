from aiogram import types, Router, filters, F
from aiogram.fsm.context import FSMContext
from tgbot.finite_states.menu import MenuFSM
from tgbot.funcs.add_lesson import ask_lesson_name
from tgbot.funcs.add_homework import ask_hw_name

router = Router(name=__name__)


@router.message(filters.StateFilter(MenuFSM), F.text == "Создать урок")
async def h_add_lesson(message: types, state: FSMContext) -> None:
    await ask_lesson_name(message, state)


@router.message(filters.StateFilter(MenuFSM), F.text == "Создать ДЗ")
async def h_add_hw(message: types, state: FSMContext) -> None:
    await ask_hw_name(message, state)


@router.message(filters.StateFilter(MenuFSM))
async def h_error(message: types) -> None:
    await message.answer(text="Пожалуйста, выберите действие из меню:")
