from aiogram.fsm.state import State, StatesGroup


class ChatsFSM(StatesGroup):
    send_message = State()
