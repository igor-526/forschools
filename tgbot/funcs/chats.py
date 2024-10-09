from aiogram import types
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from tgbot.funcs.fileutils import add_files_to_state, filechecker, filedownloader, send_file
from tgbot.keyboards.callbacks.chats import ChatListCallback
from tgbot.keyboards.chats import chats_get_show_message_button
from tgbot.keyboards.default import message_typing_keyboard
from tgbot.funcs.menu import send_menu
from tgbot.models import TgBotJournal
from tgbot.utils import get_tg_id
from tgbot.create_bot import bot
from tgbot.utils import get_user
from tgbot.finite_states.chats import ChatsFSM
from chat.models import Message


async def chats_show(message: types.Message, state: FSMContext):
    async def show_unread():
        unread_messages = [msg.id async for msg in Message.objects.filter(
            receiver=user,
            read__isnull=True
        ).order_by('sender', 'date')]
        for msg in unread_messages:
            await chats_notificate(msg, True)
    user = await get_user(message.from_user.id)
    unread = await user.aget_unread_messages_count()
    if unread > 0:
        await show_unread()
    await send_menu(message.from_user.id,
                    state=state,
                    custom_text="Непрочитанных сообщений нет")


async def chats_type_message(message: types.Message, state: FSMContext):
    new_data_msg = await add_files_to_state(message, state)
    new_data_msg += "\nДля отправки сообщения нажмите кнопку '<b>Отправить</b>' или добавьте ещё сообщение"
    await message.reply(new_data_msg, reply_markup=message_typing_keyboard)


async def chats_send(user_tg_id: int, state: FSMContext):
    user = await get_user(user_tg_id)
    data = await state.get_data()
    if not filechecker(data):
        await bot.send_message(chat_id=user_tg_id,
                               text="Необходимо написать сообщение или отправить вложения, либо нажать кнопку 'Отмена'")
        return
    message_status = await bot.send_message(chat_id=user_tg_id,
                                            text="Отправка...")
    try:
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
    except Exception as e:
        await message_status.edit_text(f"Не удалось отправить сообщение\n"
                                       f"Ошибка: {e}")
    await send_menu(user_tg_id, state)


async def chats_send_ask(callback: CallbackQuery,
                         to_user_id: int,
                         state: FSMContext):
    data = await state.get_data()
    if data.get("files"):
        await state.update_data({"message_for": to_user_id})
        await chats_send(callback.from_user.id, state)
        return
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


async def chats_notificate(chat_message_id: int, show=False):
    chat_message = await Message.objects.select_related("receiver").select_related("sender").aget(pk=chat_message_id)
    if chat_message.receiver:
        tg_id = await get_tg_id(chat_message.receiver, "main")
    else:
        tg_id = None
    if tg_id:
        if show:
            msg_text = (f"<b>Cообщение от {chat_message.sender.first_name} "
                        f"{chat_message.sender.last_name} [{chat_message.date.strftime('%d.%m %H:%M')}]</b>:\n"
                        f"{chat_message.message}")
            reply_markup = None
            await chat_message.aset_read()
        else:
            msg_text = (f"<b>Вам пришло сообщение от {chat_message.sender.first_name} "
                        f"{chat_message.sender.last_name}</b>")
            reply_markup = chats_get_show_message_button(chat_message.id)
        try:
            msg_text = msg_text.replace("<br>", "\n")
            msg_result = await bot.send_message(chat_id=tg_id,
                                                text=msg_text,
                                                reply_markup=reply_markup)
            attachments = [f async for f in chat_message.files.all()]
            if show:
                for attachment in attachments:
                    await send_file(tg_id, attachment)
            if not show:
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
            if not show:
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
        if not show:
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
