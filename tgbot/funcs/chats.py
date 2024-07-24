from aiogram import types
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from django.db.models import Q

from tgbot.keyboards.callbacks.chats import ChatListCallback
from tgbot.keyboards.callbacks.homework import HomeworkCallback
from tgbot.keyboards.chats import chats_get_users_buttons, chats_get_answer_button
from tgbot.keyboards.materials import get_keyboard_query_user
from tgbot.keyboards.homework import (get_homework_item_buttons, get_homeworks_buttons,
                                      get_hwlogs_buttons)
from tgbot.keyboards.default import ready_cancel_keyboard, cancel_keyboard
from tgbot.finite_states.homework import HomeworkFSM
from tgbot.funcs.menu import send_menu
from tgbot.utils import get_tg_id, get_user
from profile_management.models import NewUser
from homework.models import Homework, HomeworkLog
from material.models import File
from tgbot.create_bot import bot
from tgbot.utils import get_group_and_perms, get_user
from homework.utils import status_code_to_string
from material.utils.get_type import get_type
from aiogram.utils.media_group import MediaGroupBuilder
from dls.settings import MEDIA_ROOT
from tgbot.finite_states.chats import ChatsFSM
from chat.models import Message


async def chats_show(message: types.Message):
    user = await get_user(message.from_user.id)
    chats = await user.aget_users_for_chat()
    await message.answer(text="Выберите пользователя:",
                         reply_markup=chats_get_users_buttons(chats))


async def chats_send(message: types.Message, state: FSMContext):
    user = await get_user(message.from_user.id)
    data = await state.get_data()
    chat_message = await Message.objects.acreate(
        receiver_id=data.get('message_for'),
        sender_id=user.id,
        message=message.text,
    )
    await chats_notificate(chat_message.id)
    await message.answer("Сообщение отправлено")
    await send_menu(message, state)


async def chats_send_ask(callback: CallbackQuery,
                         to_user_id: int,
                         state: FSMContext):
    await bot.send_message(callback.message.chat.id,
                           "Напишите сообщение",
                           reply_markup=cancel_keyboard)
    await state.set_state(ChatsFSM.send_message)
    await state.set_data({"message_for": to_user_id})


async def chats_notificate(chat_message_id: int):
    chat_message = await Message.objects.select_related("receiver").select_related("sender").aget(pk=chat_message_id)
    tg_id = await get_tg_id(chat_message.receiver)
    if tg_id:
        await bot.send_message(chat_id=tg_id,
                               text=f"<b>Новое сообщение от {chat_message.sender.first_name} "
                                    f"{chat_message.sender.last_name}</b>\n"
                                    f"{chat_message.message}",
                               reply_markup=chats_get_answer_button(chat_message.sender.id))


async def chats_show_unread_messages(callback: CallbackQuery,
                                     callback_data: ChatListCallback):
    user = await get_user(callback.message.chat.id)
    messages = [msg async for msg in Message.objects.filter(receiver=user,
                                                            sender__id=callback_data.user_id,
                                                            read__isnull=True)]
    for msg in messages:
        await chats_notificate(msg.id)
        await msg.aset_read()
