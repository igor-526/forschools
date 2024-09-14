from aiogram.fsm.state import StatesGroup, State


class HomeworkFSM(StatesGroup):
    send_hw_files = State()
    search = State()


class HomeworkNewFSM(StatesGroup):
    change_menu = State()
    change_name = State()
    change_description = State()
    change_deadline = State()
    delete_materials = State()
