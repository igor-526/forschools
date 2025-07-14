from aiogram.fsm.state import State, StatesGroup


class MaterialFSM(StatesGroup):
    material_search = State()
    material_add = State()
