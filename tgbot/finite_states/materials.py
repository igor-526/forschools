from aiogram.fsm.state import StatesGroup, State


class MaterialFSM(StatesGroup):
    material_search = State()
    material_add = State()
