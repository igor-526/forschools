from aiogram import types
from aiogram.fsm.context import FSMContext
from tgbot.finite_states.add_homework import AddHomework
from lesson.models import Lesson
from homework.models import Homework
from profile_management.models import Telegram
from tgbot.funcs.menu import send_menu
from tgbot.create_bot import bot
from tgbot.keyboards.show_keyboard import get_show_keys_hw_l


async def ask_hw_name(message: types.Message, state: FSMContext) -> None:
    await message.answer(text="Введите название дз")
    await state.set_state(AddHomework.name)


async def ask_lesson(message: types.Message, state: FSMContext) -> None:
    lessons = [_ async for _ in Lesson.objects.select_related('teacher').select_related('listener').all()]
    msg = "К какому уроку привязать ДЗ?\n\n"
    for num, lesson in enumerate(lessons):
        msg += f'{num + 1}. {lesson.name}\n'
    await message.answer(text=msg)
    await state.update_data({'lesson': lessons})
    await state.set_state(AddHomework.lesson)


async def add_hw(message: types.Message, state: FSMContext) -> None:
    data = await state.get_data()
    hw = await Homework.objects.acreate(
        name=data['name'],
        lesson=data['lesson'],
        teacher=data['lesson'].teacher,
        listener=data['lesson'].listener,
    )
    await message.answer(text='ДЗ создано')
    await send_menu(message, state)
    listener_tg = await Telegram.objects.filter(user=data['lesson'].listener).afirst()
    await bot.send_message(chat_id=listener_tg.tg_id,
                           text="У Вас новое домашнее задание!",
                           reply_markup=get_show_keys_hw_l(hw_id=hw.id,
                                                           role=1))


