from aiogram.fsm.state import StatesGroup, State


class MenuFSM(StatesGroup):
    main_menu = State()
