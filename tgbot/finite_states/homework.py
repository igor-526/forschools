from aiogram.fsm.state import StatesGroup, State


class HomeworkFSM(StatesGroup):
    send_hw_files = State()
    search = State()


class HomeworkNewFSM(StatesGroup):
    change_menu = State()


class HomeworkAgreementFSM(StatesGroup):
    message = State()


class HomeworkLogFSM(StatesGroup):
    edit_log = State()
