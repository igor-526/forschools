from aiogram.fsm.context import FSMContext
from profile_management.models import Telegram
from tgbot.create_bot import bot
from tgbot.keyboards import get_menu_keyboard
from tgbot.utils import aget_user_groups
from chat.utils import aget_unread_messages
from dls.settings import DEBUG


async def send_menu(user_tg_id: int, state: FSMContext, custom_text="Выберите действие: ") -> None:
    tg_note = await Telegram.objects.select_related("user").aget(tg_id=user_tg_id)
    groups = await aget_user_groups(tg_note.user.id)
    materials = False
    homeworks = False
    lessons = False
    messages = False
    settings = False
    if 'Listener' in groups:
        materials = False
        homeworks = True
        lessons = True
        messages = True
        settings = True
    elif 'Curator' in groups:
        materials = False
        homeworks = True
        messages = True
        settings = True
    elif 'Teacher' in groups:
        materials = False
        homeworks = True
        lessons = True
        messages = True
        settings = True
    elif 'Metodist' in groups:
        materials = False
        homeworks = True
        lessons = "select"
        messages = True
        settings = True
    elif 'Admin' in groups:
        materials = False
        homeworks = True
        lessons = True
        messages = True
        settings = True
    multiuser = await tg_note.allowed_users.acount() > 1
    await state.clear()
    if DEBUG:
        token = None
    else:
        token = tg_note.access_token
    await bot.send_message(chat_id=user_tg_id,
                           text=custom_text,
                           reply_markup=get_menu_keyboard(len(await aget_unread_messages(tg_note)),
                                                          materials, homeworks, lessons, messages,
                                                          settings, multiuser, token))
