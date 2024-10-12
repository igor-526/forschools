from aiogram import types
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from profile_management.models import Telegram, aget_unread_messages_count
from tgbot.funcs.fileutils import add_files_to_state, filechecker, filedownloader, send_file
from tgbot.keyboards.callbacks.chats import ChatListCallback
from tgbot.keyboards.default import message_typing_keyboard
from tgbot.funcs.menu import send_menu
from tgbot.models import TgBotJournal
from tgbot.utils import get_tg_id
from tgbot.create_bot import bot
from tgbot.finite_states.chats import ChatsFSM
from chat.models import Message


async def chats_show(message: types.Message, state: FSMContext):
    async def show_unread():
        tgnote = await Telegram.objects.select_related("user").aget(tg_id=message.from_user.id)
        query = {
            "read__isnull": True
        }
        if tgnote.usertype == "main":
            query["receiver"] = tgnote.user
        else:
            query["receiver_tg"] = tgnote
        unread_messages = [msg.id async for msg in Message.objects.filter(**query).order_by('sender', 'date')]
        for msg in unread_messages:
            await chats_notificate(msg, True)

    tg_note = await Telegram.objects.select_related("user").aget(tg_id=message.from_user.id)
    unread = await aget_unread_messages_count(tg_note)
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
    tgnote = await Telegram.objects.select_related("user").aget(tg_id=user_tg_id)
    data = await state.get_data()
    if not filechecker(data):
        await bot.send_message(chat_id=user_tg_id,
                               text="Необходимо написать сообщение или отправить вложения, либо нажать кнопку 'Отмена'")
        return
    message_status = await bot.send_message(chat_id=user_tg_id,
                                            text="Отправка...")
    chat_type = data.get("chat_type")
    try:
        hwdata = await filedownloader(data, owner=tgnote.user, t="Сообщение")
        chat_message = Message()
        if tgnote.usertype == "main":
            if chat_type == "NewUser":
                chat_message = await Message.objects.acreate(
                    receiver_id=data.get('message_for'),
                    sender_id=tgnote.user.id,
                    message=hwdata.get("comment"),
                )
            elif chat_type == "Telegram":
                chat_message = await Message.objects.acreate(
                    receiver_tg_id=data.get('message_for'),
                    sender_id=tgnote.user.id,
                    message=hwdata.get("comment"),
                )
        else:
            if chat_type == "NewUser":
                chat_message = await Message.objects.acreate(
                    receiver_id=data.get('message_for'),
                    sender_tg_id=tgnote.id,
                    message=hwdata.get("comment"),
                )
                await chat_message.files.aset(hwdata.get("files_db"))
                await chat_message.asave()
            elif chat_type == "Telegram":
                chat_message = await Message.objects.acreate(
                    receiver_tg_id=data.get('message_for'),
                    sender_tg_id=tgnote.id,
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
                         callback_data: ChatListCallback,
                         state: FSMContext):
    data = await state.get_data()
    if data.get("files"):
        await state.update_data({"message_for": callback_data.user_id,
                                 "chat_type": callback_data.usertype})
        await chats_send(callback.from_user.id, state)
        return
    await bot.send_message(callback.message.chat.id,
                           "Напишите сообщение, после чего нажмите кнопку 'Отправить'",
                           reply_markup=message_typing_keyboard)
    await state.set_state(ChatsFSM.send_message)
    await state.set_data({"message_for": callback_data.user_id,
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
    async def journal_note(result, message: Message):
        message_sender_type = "NewUser" if message.sender else "Telegram"
        if message.receiver or message.receiver_tg:
            message_receiver_type = "NewUser" if message.receiver else "Telegram"
        else:
            message_receiver_type = None
        if message_receiver_type:
            usersdata = {}
            if message_sender_type == "NewUser":
                usersdata["initiator"] = chat_message.sender
            elif message_sender_type == "Telegram":
                usersdata["initiator"] = message.sender_tg.user
            if message_receiver_type == "NewUser":
                usersdata["recipient"] = chat_message.receiver
            elif message_receiver_type == "Telegram":
                usersdata["recipient"] = message.receiver_tg.user
            await TgBotJournal.objects.acreate(
                event=7,
                data={
                    "status": "success",
                    "text": msg_text,
                    "msg_id": result.message_id,
                    "errors": [],
                    "attachments": [att.id async for att in message.files.all()]
                },
                **usersdata
            )

    async def notificate_parents(message: Message):
        if message.sender:
            if message.receiver:
                receiver_fullname = f'{chat_message.receiver.first_name} {chat_message.receiver.last_name}'
            else:
                receiver_fullname = (f'{chat_message.receiver_tg.user.first_name} {chat_message.receiver_tg.user.last_name}'
                                     f'({chat_message.receiver_tg.usertype})')

            parents = [tgnote.tg_id async for tgnote in
                       Telegram.objects.filter(user=message.sender).exclude(usertype="main")]
            parent_msg_text = (f"<b>Новое сообщение <b>ОТ УЧЕНИКА ДЛЯ</b> {receiver_fullname}"
                               f" [{chat_message.date.strftime('%d.%m %H:%M')}]</b>:\n"
                               f"{chat_message.message}")
            parent_msg_text = parent_msg_text.replace("<br>", "\n")
            for p_tg_id in parents:
                await bot.send_message(chat_id=p_tg_id,
                                       text=parent_msg_text,
                                       reply_markup=None)
                for attachment in attachments:
                    await send_file(p_tg_id, attachment)

    chat_message = await (Message.objects.select_related("receiver")
                          .select_related("receiver_tg").select_related("receiver_tg__user").select_related("sender")
                          .select_related("sender_tg").select_related("sender_tg__user").aget(pk=chat_message_id))
    parents_tg_ids = []
    if chat_message.receiver:
        tg_id = await get_tg_id(chat_message.receiver.id, "main")
    else:
        tg_id = chat_message.receiver_tg.tg_id
    if chat_message.sender:
        fullname = f'{chat_message.sender.first_name} {chat_message.sender.last_name}'
    else:
        fullname = (f'{chat_message.sender_tg.user.first_name} {chat_message.sender_tg.user.last_name}'
                    f'({chat_message.sender_tg.usertype})')
    if tg_id:
        try:
            msg_text = (f"<b>Cообщение от {fullname}"
                        f" [{chat_message.date.strftime('%d.%m %H:%M')}]</b>:\n"
                        f"{chat_message.message}")
            msg_text = msg_text.replace("<br>", "\n")
            msg_result = await bot.send_message(chat_id=tg_id,
                                                text=msg_text,
                                                reply_markup=None)
            await journal_note(msg_result, chat_message)
            if not show:
                parents_tg_ids = [tgnote.tg_id async for tgnote in
                                  Telegram.objects.filter(user_id=chat_message.receiver.id).exclude(usertype="main")]
                if parents_tg_ids:
                    msg_text = (f"<b>Cообщение <b>ДЛЯ УЧЕНИКА</b> от {chat_message.sender.first_name} "
                                f"{chat_message.sender.last_name} [{chat_message.date.strftime('%d.%m %H:%M')}]</b>:\n"
                                f"{chat_message.message}")
                    msg_text = msg_text.replace("<br>", "\n")
                    for parent_tg_id in parents_tg_ids:
                        await bot.send_message(chat_id=parent_tg_id,
                                               text=msg_text,
                                               reply_markup=None)
            attachments = [f async for f in chat_message.files.all()]
            await notificate_parents(chat_message)
            for attachment in attachments:
                for all_tg_id in [tg_id, *parents_tg_ids]:
                    await send_file(all_tg_id, attachment)
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
