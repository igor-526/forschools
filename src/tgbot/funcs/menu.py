from aiogram.fsm.context import FSMContext

from chat.utils import aget_unread_messages

from profile_management.models import Telegram

from tgbot.create_bot import bot
from tgbot.keyboards.menu_keyboard import get_menu_keyboard
from tgbot.utils import aget_user_groups


async def send_menu(user_tg_id: int,
                    state: FSMContext,
                    custom_text="Выберите действие: ") -> None:
    tg_note = await Telegram.objects.select_related(
        "user").aget(tg_id=user_tg_id)
    groups = await aget_user_groups(tg_note.user.id)
    lessons = False
    homeworks = False
    messages = False
    settings = False
    if 'Listener' in groups:
        homeworks = True
        messages = True
        lessons = True
        settings = True
    elif 'Curator' in groups:
        homeworks = True
        messages = True
        settings = True
    elif 'Teacher' in groups:
        homeworks = True
        messages = True
        lessons = True
        settings = True
    elif 'Metodist' in groups:
        homeworks = True
        messages = True
        lessons = "select"
        settings = True
    elif 'Admin' in groups:
        homeworks = True
        messages = True
        lessons = True
        settings = True
    multiuser = (await tg_note.allowed_users.acount() +
                 await tg_note.allowed_parents.acount() > 1)
    await state.clear()
    await bot.send_message(
        chat_id=user_tg_id,
        text=custom_text,
        reply_markup=get_menu_keyboard(
            len(await aget_unread_messages(tg_note)),
            homeworks, messages,
            settings, multiuser, lessons
        )
    )
