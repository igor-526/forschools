from aiogram.fsm.state import State, StatesGroup


class AddLesson(StatesGroup):
    name = State()
    listener = State()
