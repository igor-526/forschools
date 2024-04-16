from aiogram import types, Router, F
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from tgbot.finite_states.menu import MenuFSM
from tgbot.funcs.menu import send_menu
from tgbot.funcs.homeworks import show_homework_queryset

router = Router(name=__name__)


@router.message(StateFilter(MenuFSM.main_menu),
                F.text == "Материалы")
async def h_mainmenu_materials(message: types.Message, state: FSMContext) -> None:
    await message.answer("На данный момент функция находится в разработке")
    await message.delete()


@router.message(StateFilter(MenuFSM.main_menu),
                F.text == "Домашние задания")
async def h_mainmenu_homeworks(message: types.Message, state: FSMContext) -> None:
    await show_homework_queryset(message)


@router.message(StateFilter(MenuFSM.main_menu))
async def h_mainmenu_invalid(message: types.Message, state: FSMContext) -> None:
    await message.answer("Я Вас не понял :(\n"
                         "Выберите действие на клавиатуре")
    await send_menu(message, state)

