from aiogram.fsm.state import StatesGroup, State


class ChatsFSM(StatesGroup):
    send_message = State()
