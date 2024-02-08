from aiogram import types, Router, filters
from tgbot.finite_states.add_homework import AddHomework
from aiogram.fsm.context import FSMContext
from tgbot.funcs.add_homework import ask_hw_name, ask_lesson, add_hw

router = Router(name=__name__)


@router.message(filters.StateFilter(AddHomework.lesson))
async def hw_lesson(message: types.Message, state: FSMContext):
    data = await state.get_data()
    try:
        num = int(message.text) - 1
        lesson = data['lesson'][num]
        await state.update_data({'lesson': lesson})
        await add_hw(message, state)
    except ValueError:
        await message.answer(text="Напишите цифру")
    except IndexError:
        await message.answer(text="Напишите цифу в диапазоне!")