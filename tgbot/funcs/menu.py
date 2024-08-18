from aiogram import types
from aiogram.fsm.context import FSMContext
from tgbot.finite_states.menu import MenuFSM
from tgbot.keyboards import get_menu_keyboard
from tgbot.utils import get_user, get_group_and_perms


async def send_menu(message: types.Message, state: FSMContext, delete=True) -> None:
    user = await get_user(message.from_user.id)
    perms = await get_group_and_perms(user.id)
    materials = False
    homeworks = False
    lessons = False
    if 'Listener' in perms.get('groups'):
        materials = True
        homeworks = True
        lessons = True
    else:
        homeworks = True
        lessons = True
    await state.clear()
    if delete:
        await message.delete()
    await message.answer(text="Выберите действие: ",
                         reply_markup=get_menu_keyboard(await user.aget_unread_messages_count(),
                                                        materials,
                                                        homeworks,
                                                        lessons))
    await state.set_state(MenuFSM.main_menu)
