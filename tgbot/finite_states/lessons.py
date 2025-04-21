from aiogram.fsm.state import StatesGroup, State


class LessonsFSM(StatesGroup):
    user_search = State()


class LessonReviewFSM(StatesGroup):
    name = State()
    materials = State()
    lexis = State()
    grammar = State()
    note = State()
    org = State()
    confirm = State()
