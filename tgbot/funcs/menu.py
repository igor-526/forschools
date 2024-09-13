from aiogram import types
from aiogram.fsm.context import FSMContext

from tgbot.create_bot import bot
from tgbot.finite_states.menu import MenuFSM
from tgbot.keyboards import get_menu_keyboard
from tgbot.utils import get_user, get_group_and_perms


async def send_menu(user_tg_id: int, state: FSMContext) -> None:
    user = await get_user(user_tg_id)
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
    await bot.send_message(chat_id=user_tg_id,
                           text="Выберите действие: ",
                           reply_markup=get_menu_keyboard(await user.aget_unread_messages_count(),
                                                          materials,
                                                          homeworks,
                                                          lessons))
    await state.set_state(MenuFSM.main_menu)
