from aiogram import types, Router, filters
from aiogram.fsm.context import FSMContext
from tgbot.funcs.add_lesson import ask_listener
from tgbot.funcs.add_lesson import AddLesson

router = Router(name=__name__)


@router.message(filters.StateFilter(AddLesson.name))
async def get_name(message: types.Message, state: FSMContext):
    await state.update_data({'name': message.text})
    await ask_listener(message, state)
