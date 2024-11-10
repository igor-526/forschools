from aiogram.fsm.state import StatesGroup, State


class HomeworkFSM(StatesGroup):
    send_hw_files = State()
    search = State()


class HomeworkNewFSM(StatesGroup):
    change_menu = State()
    delete_materials = State()


class HomeworkAgreementFSM(StatesGroup):
    message = State()
