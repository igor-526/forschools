from aiogram.fsm.state import StatesGroup, State


class LessonsFSM(StatesGroup):
    user_search = State()
