from aiogram import types, Router, filters
from aiogram.fsm.context import FSMContext
from tgbot.funcs.add_lesson import new_lesson
from tgbot.funcs.add_lesson import AddLesson

router = Router(name=__name__)


@router.message(filters.StateFilter(AddLesson.listener))
async def get_listener(message: types.Message, state: FSMContext):
    data = await state.get_data()
    try:
        num = int(message.text) - 1
        listener = data.get('listener')[num]
        await state.update_data({'listener': listener})
        await new_lesson(message, state)
    except ValueError:
        await message.answer("Пожалуйста, введите номер ученика")
    except IndexError:
        await message.answer("Пожалуйста, введите номер")
