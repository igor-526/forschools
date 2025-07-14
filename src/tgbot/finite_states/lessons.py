from aiogram.fsm.state import State, StatesGroup


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
