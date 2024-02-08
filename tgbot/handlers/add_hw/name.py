from aiogram import types, Router, filters
from aiogram.fsm.context import FSMContext
from tgbot.funcs.add_homework import ask_hw_name, ask_lesson, add_hw
from tgbot.finite_states.add_homework import AddHomework

router = Router(name=__name__)


@router.message(filters.StateFilter(AddHomework.name))
async def hw_name(message: types.Message, state: FSMContext):
    await state.update_data({'name': message.text})
    await ask_lesson(message, state)
