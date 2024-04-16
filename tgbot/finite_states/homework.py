from aiogram.fsm.state import StatesGroup, State


class HomeworkFSM(StatesGroup):
    send_hw_files = State()
    send_hw_accept = State()
