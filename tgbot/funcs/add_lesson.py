from aiogram import types
from aiogram.fsm.context import FSMContext
from tgbot.finite_states.add_lesson import AddLesson
from profile_management.models import NewUser, Telegram
from lesson.models import Lesson
from tgbot.funcs.menu import send_menu


async def ask_lesson_name(message: types.Message, state: FSMContext) -> None:
    await message.answer(text="Введите название занятия: ")
    await state.set_state(AddLesson.name)


async def ask_listener(message: types.Message, state: FSMContext) -> None:
    listeners = [_ async for _ in NewUser.objects.all()]
    msg = "Выберите ученика:\n\n"
    for num, listener in enumerate(listeners):
        msg += f'{num+1}. {listener}\n'
    await message.answer(text=msg)
    await state.update_data({'listener': listeners})
    await state.set_state(AddLesson.listener)


async def new_lesson(message: types.Message, state: FSMContext) -> None:
    data = await state.get_data()
    teacher = await Telegram.objects.select_related('user').filter(tg_id=message.from_user.id).afirst()
    await Lesson.objects.acreate(name=data['name'],
                                 teacher=teacher.user,
                                 listener=data['listener'],
                                 zoom_url='https://1.ru')
    await message.answer("Занятие создан")
    await send_menu(message.from_user.id, state)


