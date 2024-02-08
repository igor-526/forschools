from aiogram.fsm.state import State, StatesGroup


class AddHomework(StatesGroup):
    name = State()
    lesson = State()

