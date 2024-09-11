from aiogram import types
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from tgbot.funcs.fileutils import add_files_to_state, filechecker, filedownloader, send_file
from tgbot.keyboards.callbacks.chats import ChatListCallback
from tgbot.keyboards.chats import chats_get_users_buttons, chats_get_answer_button
from tgbot.keyboards.default import message_typing_keyboard
from tgbot.funcs.menu import send_menu
from tgbot.models import TgBotJournal
from tgbot.utils import get_tg_id
from tgbot.create_bot import bot
from tgbot.utils import get_user
from tgbot.finite_states.chats import ChatsFSM
from chat.models import Message


async def chats_show(message: types.Message):
    user = await get_user(message.from_user.id)
    chats = await user.aget_users_for_chat()
    await message.answer(text="Выберите пользователя:",
                         reply_markup=chats_get_users_buttons(chats))


async def chats_type_message(message: types.Message, state: FSMContext):
    await add_files_to_state(message, state)


async def chats_send(message: types.Message, state: FSMContext):
    user = await get_user(message.from_user.id)
    data = await state.get_data()
    if not filechecker(data):
        await message.answer("Необходимо написать сообщение или отправить вложения, либо нажать кнопку 'Отмена'")
        return
    message_status = await message.answer("Отправка...")
    hwdata = await filedownloader(data, owner=user, t="Сообщение")
    chat_message = await Message.objects.acreate(
        receiver_id=data.get('message_for'),
        sender_id=user.id,
        message=hwdata.get("comment"),
    )
    await chat_message.files.aset(hwdata.get("files_db"))
    await chat_message.asave()
    await chats_notificate(chat_message.id)
    await message_status.edit_text("Сообщение отправлено")
    await send_menu(message, state, False)


async def chats_send_ask(callback: CallbackQuery,
                         to_user_id: int,
                         state: FSMContext):
    await bot.send_message(callback.message.chat.id,
                           "Напишите сообщение, после чего нажмите кнопку 'Отправить'",
                           reply_markup=message_typing_keyboard)
    await state.set_state(ChatsFSM.send_message)
    await state.set_data({"message_for": to_user_id,
                          'files': {
                              'text': [],
                              'photo': [],
                              'voice': [],
                              'audio': [],
                              'video': [],
                              'animation': [],
                              'document': [],
                          }
                          })


async def chats_notificate(chat_message_id: int):
    chat_message = await Message.objects.select_related("receiver").select_related("sender").aget(pk=chat_message_id)
    tg_id = await get_tg_id(chat_message.receiver)
    if tg_id:
        msg_text = (f"<b>Новое сообщение от {chat_message.sender.first_name} "
                    f"{chat_message.sender.last_name}</b>\n{chat_message.message}")
        try:
            msg_result = await bot.send_message(chat_id=tg_id,
                                                text=msg_text,
                                                reply_markup=chats_get_answer_button(chat_message.id))
            attachments = [f async for f in chat_message.files.all()]
            for attachment in attachments:
                await send_file(tg_id, attachment)
            await TgBotJournal.objects.acreate(
                recipient=chat_message.receiver,
                initiator=chat_message.sender,
                event=7,
                data={
                    "status": "success",
                    "text": msg_text,
                    "msg_id": msg_result.message_id,
                    "errors": [],
                    "attachments": [att.id for att in attachments]
                }
            )
        except Exception as e:
            await TgBotJournal.objects.acreate(
                recipient=chat_message.receiver,
                initiator=chat_message.sender,
                event=7,
                data={
                    "status": "error",
                    "text": None,
                    "msg_id": None,
                    "errors": [str(e)],
                    "attachments": []
                }
            )
    else:
        await TgBotJournal.objects.acreate(
            recipient=chat_message.receiver,
            initiator=chat_message.sender,
            event=7,
            data={
                "status": "error",
                "text": None,
                "msg_id": None,
                "errors": ["У пользователя не привязан Telegram"],
                "attachments": []
            }
        )


async def chats_show_unread_messages(callback: CallbackQuery,
                                     callback_data: ChatListCallback):
    user = await get_user(callback.message.chat.id)
    messages = [msg async for msg in Message.objects.filter(receiver=user,
                                                            sender__id=callback_data.user_id,
                                                            read__isnull=True)]
    for msg in messages:
        await chats_notificate(msg.id)
        await msg.aset_read()
