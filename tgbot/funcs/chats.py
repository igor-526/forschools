from aiogram import types
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from django.db.models import Q
from profile_management.models import Telegram, aget_unread_messages_count, NewUser
from tgbot.funcs.fileutils import send_file
from tgbot.funcs.materials_add import FileParser
from tgbot.keyboards.callbacks.chats import ChatListCallback
from tgbot.keyboards.chats import chats_get_show_message_page_button, chats_get_answer_message_button
from tgbot.keyboards.default import get_chat_typing_keyboard
from tgbot.funcs.menu import send_menu
from tgbot.models import TgBotJournal
from tgbot.utils import get_tg_id, get_user
from tgbot.create_bot import bot
from chat.models import Message, GroupChats, AdminMessage


async def chats_show(message: types.Message, state: FSMContext):
    async def show_unread():
        tgnote = await Telegram.objects.select_related("user").aget(tg_id=message.from_user.id)
        query = {
            "filter": {},
            "exclude": {},
            "reading": {}
        }
        if tgnote.usertype == "main":
            query['filter']["receiver_id"] = tgnote.user.id
            query['exclude']['read_data__has_key'] = f'nu{tgnote.user.id}'
            query['reading']["user_id"] = tgnote.user.id
            query['reading']["usertype"] = 'NewUser'
        else:
            query['filter']["receiver_tg_id"] = tgnote.id
            query['exclude']['read_data__has_key'] = f'tg{tgnote.id}'
            query['reading']["user_id"] = tgnote.id
            query['reading']["usertype"] = 'Telegram'
        unread_messages = [
            msg async for msg in
            Message.objects.filter(**query['filter']).exclude(**query['exclude']).
            order_by('sender', 'sender_tg', 'date')
        ]
        for msg in unread_messages:
            await msg.aset_read(**query['reading'])
            await chats_notify(msg.id, True)

    tg_note = await Telegram.objects.select_related("user").aget(tg_id=message.from_user.id)
    unread = await aget_unread_messages_count(tg_note)
    if unread > 0:
        await show_unread()
    else:
        is_admin = await tg_note.user.groups.filter(name='Admin').aexists()
        await message.answer(text="Все диалоги:",
                             reply_markup=chats_get_show_message_page_button(is_admin))


async def chats_type_message(messages: list[types.Message], state: FSMContext):
    state_data = await state.get_data()
    user = await get_user(messages[0].from_user.id)
    is_listener = await user.groups.filter(name="Listener").aexists()
    if is_listener and not state_data.get('message_for'):
        success_text = ("Если вы отправляете сообщение, связанное с выполнением домашнего задания, нажмите кнопку "
                        "'<b>Отправить решение ДЗ</b>'. Если ваш вопрос или сообщение не связано с домашним заданием, "
                        "выберите кнопку '<b>Отправить</b>'")
    else:
        success_text = "Для отправки сообщения нажмите кнопку '<b>Отправить</b>' или добавьте ещё сообщение"
    files_list = []
    comments_list = []
    for m in messages:
        file = FileParser(
            message=m,
            mode="file",
            success_text=success_text,
            reply_markup=get_chat_typing_keyboard(is_listener and not state_data.get('message_for')),
            add_time_stamp=False,
            ignore_text=True
        )
        await file.download()

        if file.ready_file:
            files_list.append(file.ready_file.id)
        if file.file_description:
            comments_list.append(file.file_description)
    state_data = await state.get_data()
    state_data["files"].extend(files_list)
    state_data["comment"].extend(comments_list)
    await state.set_data(state_data)


async def admin_chat_send(state: FSMContext, state_data, tg_note: Telegram, message_status: types.Message):
    async def create_message():
        query_params = {
            "message": "\n".join(state_data['comment'])
        }
        is_admin = await tg_note.user.groups.filter(name="Admin").aexists()
        if is_admin:
            query_params['receiver_id'] = state_data.get('message_for')
            query_params['sender_id'] = tg_note.user.id
        else:
            query_params['sender_id'] = tg_note.user.id
        obj = await AdminMessage.objects.acreate(**query_params)
        await obj.files.aset(state_data['files'])
        await obj.asave()
        obj = await AdminMessage.objects.select_related("receiver").select_related("sender").aget(pk=obj.id)
        return obj

    # try:
    chat_message = await create_message()
    await admin_chats_notify(chat_message)
    await message_status.edit_text("Сообщение отправлено")
    # except Exception as e:
    #     await message_status.edit_text(f"Не удалось отправить сообщение\n"
    #                                    f"Ошибка: {e}")
    await send_menu(tg_note.tg_id, state)


async def chats_send(user_tg_id: int, state: FSMContext):
    async def create_message(state_data, ct):
        query_params = {
            "message": "\n".join(state_data['comment']),
            "tags": state_data.get("message_tags") if state_data.get("message_tags") else []
        }
        if tg_note.usertype == "main":
            if ct == "NewUser":
                query_params['receiver_id'] = state_data.get('message_for')
                query_params['sender_id'] = tg_note.user.id
            elif ct == "Telegram":
                query_params['receiver_tg_id'] = state_data.get('message_for')
                query_params['sender_id'] = tg_note.user.id
        else:
            if ct == "NewUser":
                query_params['receiver_id'] = state_data.get('message_for')
                query_params['sender_tg_id'] = tg_note.id
            elif ct == "Telegram":
                query_params['receiver_tg_id'] = state_data.get('message_for')
                query_params['sender_tg_id'] = tg_note.id
        obj = await Message.objects.acreate(**query_params)
        await obj.files.aset(state_data['files'])
        await obj.asave()
        return obj

    tg_note = await Telegram.objects.select_related("user").aget(tg_id=user_tg_id)
    data = await state.get_data()
    message_status = await bot.send_message(chat_id=user_tg_id,
                                            text="Отправка...")
    chat_type = data.get("chat_type")
    if chat_type == "Admin":
        await admin_chat_send(state, data, tg_note, message_status)
        return
    try:
        chat_message = await create_message(data, chat_type)
        await chats_notify(chat_message.id, False)
        await message_status.edit_text("Сообщение отправлено")
        await aget_unread_messages_count(tg_note, {
            "id": data.get('message_for'),
            "usertype": chat_type
        }, True)
    except Exception as e:
        await message_status.edit_text(f"Не удалось отправить сообщение\n"
                                       f"Ошибка: {e}")
    await send_menu(user_tg_id, state)


async def chats_group_send(user_tg_id: int, state: FSMContext):
    async def notify(tg_ids, message: Message, text_type="user"):
        msg_text = ""
        if text_type == "user":
            msg_text = f'<b>Новое сообщение из "{group.name}"</b>\n{message.message}'
        elif text_type == "receiver_parent":
            msg_text = f'<b>Новое сообщение ДЛЯ УЧЕНИКА из "{group.name}"</b>\n{message.message}'
        elif text_type == "sender_parent":
            msg_text = f'<b>Новое сообщение ОТ УЧЕНИКА в "{group.name}"</b>\n{message.message}'
        for tg_id in tg_ids:
            msg_result = await bot.send_message(chat_id=tg_id,
                                                text=msg_text)
            for attachment in [att async for att in chat_message.files.all()]:
                await send_file(tg_id, attachment)

    async def get_notify_ids(t_note):
        tg_ids = {}
        if t_note.usertype == "main":
            tg_ids["users_tg_id"] = [t_note.tg_id async for t_note in group.users_tg.all()]
            tg_ids["receiver_parents_tg_id"] = [t_note.tg_id async for t_note in
                                                Telegram.objects.filter(user__in=group.users.exclude(
                                                    id=chat_message.sender.id))
                                                .exclude(Q(usertype="main") | Q(tg_id__in=tg_ids["users_tg_id"]))]
            tg_ids["sender_parents_tg_id"] = [t_note.tg_id async for t_note in chat_message.sender.telegram.exclude(
                usertype="main")]
            tg_ids["receivers_tg_id"] = [t_note.tg_id async for t_note in
                                         Telegram.objects.filter(user__in=group.users.exclude(id=chat_message.sender.id),
                                                                 usertype="main")]
        else:
            tg_ids["users_tg_id"] = [t_note.tg_id async for t_note in group.users_tg.exclude(id=t_note.id)]
            tg_ids["receiver_parents_tg_id"] = [t_note.tg_id async for t_note in
                                                Telegram.objects.filter(
                                                    user_id__in=[u.id async for u in group.users.all()])
                                                .exclude(Q(usertype="main") | Q(tg_id__in=tg_ids["users_tg_id"]) |
                                                         Q(id=t_note.id))]
            tg_ids["sender_parents_tg_id"] = [t_note.tg_id async for t_note in
                                              Telegram.objects.filter(user_id=t_note.id).exclude(usertype="main")]
            tg_ids["receivers_tg_id"] = [t_note.tg_id async for t_note in
                                         Telegram.objects.filter(user_id__in=[u.id async for u in group.users.all()],
                                                                 usertype="main")]
        return tg_ids

    tg_note = await Telegram.objects.select_related("user").aget(tg_id=user_tg_id)
    data = await state.get_data()
    message_status = await bot.send_message(chat_id=user_tg_id,
                                            text="Отправка...")
    try:
        query_params = {
            'message': "\n".join(data.get("comment")),
            'receiver_id': data.get('message_for')
        }
        if tg_note.usertype == "main":
            query_params['sender_id'] = tg_note.user.id
        else:
            query_params['sender_tg_id'] = tg_note.id
        chat_message = await Message.objects.acreate(**query_params)
        await chat_message.files.aset(data.get("files"))
        await chat_message.asave()
        group = await GroupChats.objects.aget(id=data.get('message_for'))
        await group.messages.aadd(chat_message)
        await group.asave()
        chat_message = await Message.objects.select_related("sender").aget(id=chat_message.id)
        notify_tg_ids = await get_notify_ids(tg_note)
        await notify(notify_tg_ids.get('users_tg_id'), chat_message, 'user')
        await notify(notify_tg_ids.get('receivers_tg_id'), chat_message, 'user')
        await notify(notify_tg_ids.get('receiver_parents_tg_id'), chat_message, 'receiver_parent')
        await notify(notify_tg_ids.get('sender_parents_tg_id'), chat_message, 'sender_parent')
        await message_status.edit_text("Сообщение отправлено")
    except Exception as e:
        await message_status.edit_text(f"Не удалось отправить сообщение\n"
                                       f"Ошибка: {e}")
    await send_menu(user_tg_id, state)


async def chats_send_ask(callback: CallbackQuery,
                         callback_data: ChatListCallback,
                         state: FSMContext):
    data = await state.get_data()
    if not data.get("files") and not data.get("comment"):
        await send_menu(callback.from_user.id, state, "Вы не можете отправить пустое сообщение")
    await state.update_data({"message_for": callback_data.user_id,
                             "chat_type": callback_data.usertype})
    if callback_data.usertype == "Group":
        await chats_group_send(callback.from_user.id, state)
    else:
        await chats_send(callback.from_user.id, state)
    return


async def chats_notify(chat_message_id: int, show=False):
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

    async def notify_parents(message: Message):
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
                                                reply_markup=chats_get_answer_message_button(chat_message.id))
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
                    await notify_parents(chat_message)
            attachments = [f async for f in chat_message.files.all()]
            for attachment in attachments:
                await send_file(tg_id, attachment)
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


async def admin_chats_notify(message: AdminMessage):
    async def add_tg_journal_note(result: types.Message, recipient):
        if result.message_id:
            await TgBotJournal.objects.acreate(
                recipient=recipient,
                initiator=message.sender,
                event=10,
                data={
                    "status": "success",
                    "text": result.text,
                    "msg_id": result.message_id,
                    "errors": [],
                    "attachments": [att.id for att in attachments]
                }
            )
        else:
            TgBotJournal.objects.create(
                recipient=recipient,
                initiator=message.sender,
                event=10,
                data={
                    "status": "error",
                    "text": msg_text,
                    "msg_id": None,
                    "errors": [],
                    "attachments": [att.id for att in attachments]
                }
            )

    if message.receiver:
        users = [message.receiver]
        msg_text = (f"<b>Новое сообщение от администратора {message.sender.first_name} "
                    f"{message.sender.last_name}</b>\n{message.message}")
    else:
        users = [_ async for _ in NewUser.objects.filter(groups__name="Admin",
                                                         is_active=True)]
        msg_text = (f"<b>Новое сообщение администратору {message.sender.first_name} "
                    f"{message.sender.last_name}</b>\n{message.message}")
    attachments = [_ async for _ in message.files.all()]
    for user in users:
        user_tg_ids = [tg_note.tg_id async for tg_note in user.telegram.all()]
        for tg_id in user_tg_ids:
            try:
                msg_result = await bot.send_message(chat_id=tg_id,
                                                    text=msg_text,
                                                    reply_markup=chats_get_answer_message_button(message.id, "admin"))
                for attachment in attachments:
                    await send_file(tg_id, attachment)
                await add_tg_journal_note(msg_result, user)
            except Exception as e:
                await TgBotJournal.objects.acreate(
                    recipient=user,
                    initiator=message.sender,
                    event=10,
                    data={
                        "status": "error",
                        "text": msg_text,
                        "msg_id": None,
                        "errors": [str(e)],
                        "attachments": [att.id for att in attachments]
                    }
                )
        if not user_tg_ids:
            await TgBotJournal.objects.acreate(
                recipient=user,
                initiator=message.sender,
                event=10,
                data={
                    "status": "error",
                    "text": msg_text,
                    "msg_id": None,
                    "errors": ["У пользователя не привязан Telegram"],
                    "attachments": [att.id for att in attachments]
                }
            )




