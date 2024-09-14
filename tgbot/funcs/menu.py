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
    messages = False
    settings = False
    if 'Listener' in perms.get('groups'):
        materials = False
        homeworks = True
        lessons = True
        messages = True
        settings = False
    elif 'Teacher' in perms.get('groups'):
        materials = True
        homeworks = True
        lessons = True
        messages = True
        settings = False
    elif 'Metodist' in perms.get('groups'):
        materials = True
        homeworks = False
        lessons = True
        messages = True
        settings = False
    elif 'Admin' in perms.get('groups'):
        materials = True
        homeworks = False
        lessons = True
        messages = True
        settings = False
    await state.clear()
    await bot.send_message(chat_id=user_tg_id,
                           text="Выберите действие: ",
                           reply_markup=get_menu_keyboard(await user.aget_unread_messages_count(),
                                                          materials, homeworks,
                                                          lessons, messages, settings))
    await state.set_state(MenuFSM.main_menu)
