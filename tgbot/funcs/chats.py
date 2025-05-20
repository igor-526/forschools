from typing import List

from aiogram import types
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery

from chat.models import (AdminMessage, GroupChats, Message)

from django.db.models import Q

from chat.utils import aget_unread_messages
from profile_management.models import (NewUser,
                                       Telegram)

from tgbot.create_bot import bot
from tgbot.funcs.fileutils import send_file
from tgbot.funcs.materials_add import FileParser
from tgbot.funcs.menu import send_menu
from tgbot.keyboards.callbacks.chats import ChatListCallback
from tgbot.keyboards.chats import (chats_get_answer_message_button,
                                   chats_get_show_message_page_button)
from tgbot.keyboards.default import get_chat_typing_keyboard
from tgbot.models import TgBotJournal
from tgbot.tg_user_utils import get_user


async def chats_show(message: types.Message, state: FSMContext):
    async def show_unread(messages: List[Message]):
        for msg in messages:
            await chats_notify(msg.id)

    tg_note = await Telegram.objects.select_related("user").aget(
        tg_id=message.from_user.id
    )
    unread = await aget_unread_messages(tg_note, read=True)
    if len(unread) > 0:
        await show_unread(unread)
    is_admin = await tg_note.user.groups.filter(name='Admin').aexists()
    await message.answer(
        text="Все диалоги:",
        reply_markup=chats_get_show_message_page_button(is_admin)
    )


async def chats_type_message(messages: list[types.Message],
                             state: FSMContext):
    state_data = await state.get_data()
    user = await get_user(messages[0].from_user.id)
    is_listener = await user.groups.filter(name="Listener").aexists()
    if is_listener and not state_data.get('message_for'):
        success_text = ("Если вы отправляете сообщение, связанное с "
                        "выполнением домашнего задания, нажмите кнопку "
                        "'<b>Отправить решение ДЗ</b>'. Если ваш вопрос "
                        "или сообщение не связано с домашним заданием, "
                        "выберите кнопку '<b>Отправить</b>'")
    else:
        success_text = ("Для отправки сообщения нажмите кнопку "
                        "'<b>Отправить</b>' или добавьте ещё сообщение")
    files_list = []
    comments_list = []
    for m in messages:
        file = FileParser(
            message=m,
            mode="file",
            success_text=success_text,
            reply_markup=get_chat_typing_keyboard(
                is_listener and not state_data.get('message_for')
            ),
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


async def chats_send(user_tg_id: int, state: FSMContext):
    async def create_message(state_data: dict,
                             self_profile_type_: int,
                             receiver_profile_type_: int) -> Message:
        query_params = {
            "message": "<br>".join(state_data['comment']),
            "tags": state_data.get("message_tags") if
            state_data.get("message_tags") else [],
            'receiver_id': state_data.get('message_for'),
            'sender_id': tg_note.user.id,
            'sender_type': self_profile_type_,
            'receiver_type': receiver_profile_type_
        }
        obj = await Message.objects.acreate(**query_params)
        await obj.files.aset(state_data['files'])
        return obj

    async def create_admin_message(state_data: dict) -> AdminMessage:
        query_params = {
            "message": "<br>".join(state_data['comment']),
            "sender_id": tg_note.user.id,
        }
        is_admin = await tg_note.user.groups.filter(name="Admin").aexists()
        if is_admin:
            query_params['receiver_id'] = state_data.get('message_for')
        obj = await AdminMessage.objects.acreate(**query_params)
        await obj.files.aset(state_data['files'])
        return obj

    tg_note = await Telegram.objects.select_related("user").aget(
        tg_id=user_tg_id
    )
    data = await state.get_data()
    message_status = await bot.send_message(chat_id=user_tg_id,
                                            text="Отправка...")
    chat_type = data.get("chat_type")
    self_profile_type = await tg_note.aget_usertype()
    if chat_type == 2:
        chat_message = await create_admin_message(state_data=data)
        await admin_chats_notify(chat_message.id)
    else:
        chat_message = await create_message(
            state_data=data,
            self_profile_type_=self_profile_type,
            receiver_profile_type_=chat_type
        )
        await chats_notify(chat_message.id)
    await message_status.edit_text("Сообщение отправлено")

    await send_menu(user_tg_id, state)


async def chats_group_send(user_tg_id: int, state: FSMContext):
    async def notify(tg_ids, message: Message, text_type="user"):
        msg_text = ""
        if text_type == "user":
            msg_text = (f'<b>Новое сообщение из "{group.name}"</b>\n'
                        f'{message.message}')
        elif text_type == "receiver_parent":
            msg_text = (f'<b>Новое сообщение ДЛЯ УЧЕНИКА из "{group.name}"'
                        f'</b>\n{message.message}')
        elif text_type == "sender_parent":
            msg_text = (f'<b>Новое сообщение ОТ УЧЕНИКА в "{group.name}"'
                        f'</b>\n{message.message}')
        for tg_id in tg_ids:
            await bot.send_message(chat_id=tg_id,
                                   text=msg_text)
            for attachment in [att async for att in
                               chat_message.files.all()]:
                await send_file(tg_id, attachment)

    async def get_notify_ids(t_note):
        tg_ids = {}
        if t_note.usertype == "main":
            tg_ids["users_tg_id"] = [t_note.tg_id async for t_note in
                                     group.users_tg.all()]
            tg_ids["receiver_parents_tg_id"] = [
                t_note.tg_id async for t_note in
                Telegram.objects.filter(user__in=group.users.exclude(
                    id=chat_message.sender.id))
                .exclude(Q(usertype="main") |
                         Q(tg_id__in=tg_ids["users_tg_id"]))
            ]
            tg_ids["sender_parents_tg_id"] = [
                t_note.tg_id async for t_note in
                chat_message.sender.telegram.exclude(usertype="main")
            ]
            tg_ids["receivers_tg_id"] = [
                t_note.tg_id async for t_note in
                Telegram.objects.filter(
                    user__in=group.users.exclude(id=chat_message.sender.id),
                    usertype="main"
                )
            ]
        else:
            tg_ids["users_tg_id"] = [t_note.tg_id async for t_note in
                                     group.users_tg.exclude(id=t_note.id)]
            tg_ids["receiver_parents_tg_id"] = [
                t_note.tg_id async for t_note in
                Telegram.objects.filter(
                    user_id__in=[u.id async for u in group.users.all()])
                .exclude(Q(usertype="main") |
                         Q(tg_id__in=tg_ids["users_tg_id"]) |
                         Q(id=t_note.id))
            ]
            tg_ids["sender_parents_tg_id"] = [
                t_note.tg_id async for t_note in
                Telegram.objects.filter(user_id=t_note.id).
                exclude(usertype="main")
            ]
            tg_ids["receivers_tg_id"] = [
                t_note.tg_id async for t_note in
                Telegram.objects.filter(user_id__in=[u.id async for u in
                                                     group.users.all()],
                                        usertype="main")]
        return tg_ids

    tg_note = await Telegram.objects.select_related("user").aget(
        tg_id=user_tg_id
    )
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
        chat_message = await Message.objects.select_related("sender").aget(
            id=chat_message.id
        )
        notify_tg_ids = await get_notify_ids(tg_note)
        await notify(notify_tg_ids.get('users_tg_id'),
                     chat_message,
                     'user')
        await notify(notify_tg_ids.get('receivers_tg_id'),
                     chat_message,
                     'user')
        await notify(notify_tg_ids.get('receiver_parents_tg_id'),
                     chat_message,
                     'receiver_parent')
        await notify(notify_tg_ids.get('sender_parents_tg_id'),
                     chat_message,
                     'sender_parent')
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
        await send_menu(callback.from_user.id,
                        state,
                        "Вы не можете отправить пустое сообщение")
    await state.update_data({"message_for": callback_data.user_id,
                             "chat_type": callback_data.usertype})
    if callback_data.usertype == "Group":
        await chats_group_send(callback.from_user.id, state)
    else:
        await chats_send(callback.from_user.id, state)
    return


async def chats_notify(chat_message_id: int):
    async def journal_note(result, message: Message):
        await TgBotJournal.objects.acreate(
            event=7,
            data={
                "status": "success",
                "text": message.message,
                "msg_id": result.message_id,
                "errors": [],
                "attachments": [att.id async for att in message.files.all()]
            },
            initiator=chat_message.sender,
            recipient=chat_message.receiver
        )

    async def send_notification(tg_ids: List[int],
                                parents: bool = False) -> None:
        if parents:
            msg_text = (f"<b>Cообщение ДЛЯ УЧЕНИКА от "
                        f"{sender_full_name}</b>\n\n")
        else:
            msg_text = f"<b>Cообщение от {sender_full_name}</b>\n\n"

        msg_text += chat_message.message
        msg_text = msg_text.replace("<br>", "\n")
        for tg_id in tg_ids:
            msg_result = await bot.send_message(
                chat_id=tg_id,
                text=msg_text,
                reply_markup=chats_get_answer_message_button(
                    chat_message.id,
                    chat_message.sender_type
                )
            )
            attachments = [f async for f in chat_message.files.all()]
            for attachment in attachments:
                await send_file(tg_id, attachment)
            await journal_note(msg_result, chat_message)

    chat_message = await Message.objects.select_related(
        "sender", "receiver").aget(pk=chat_message_id)
    sender_full_name = (f'{chat_message.sender.first_name} '
                        f'{chat_message.sender.last_name}')
    if chat_message.sender_type == 1:
        sender_full_name += " (родитель)"
    if chat_message.receiver_type == 1:
        telegrams_parents = [
            tg_note["tg_id"] async for tg_note in
            chat_message.receiver.telegram_allowed_parent
            .values("tg_id").all()
        ]
        await send_notification(tg_ids=telegrams_parents,
                                parents=False)
        return
    telegrams_users = [
        tg_note["tg_id"] async for tg_note in
        chat_message.receiver.telegram_allowed_user.values("tg_id").all()
    ]
    if not telegrams_users:
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
        return None
    await send_notification(tg_ids=telegrams_users,
                            parents=False)
    telegrams_parents = [
        tg_note["tg_id"] async for tg_note in
        chat_message.receiver.telegram_allowed_parent.values("tg_id").all()
    ]
    if telegrams_parents:
        await send_notification(tg_ids=telegrams_parents,
                                parents=True)


async def admin_chats_notify(chat_message_id: int):
    async def add_tg_journal_note(result: types.Message, recipient):
        if result.message_id:
            await TgBotJournal.objects.acreate(
                recipient=recipient,
                initiator=admin_message.sender,
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
                initiator=admin_message.sender,
                event=10,
                data={
                    "status": "error",
                    "text": msg_text,
                    "msg_id": None,
                    "errors": [],
                    "attachments": [att.id for att in attachments]
                }
            )

    admin_message = await AdminMessage.objects.select_related(
        "receiver", "sender"
    ).aget(pk=chat_message_id)
    sender_full_name = (f'{admin_message.sender.first_name} '
                        f'{admin_message.sender.last_name}')
    if admin_message.receiver:
        users = [admin_message.receiver]
        msg_text = (f"<b>Новое сообщение от администратора "
                    f"{sender_full_name}</b>\n")
    else:
        users = [
            _ async for _ in NewUser.objects.filter(groups__name="Admin",
                                                    is_active=True)
        ]
        msg_text = (f"<b>Новое сообщение администратору от "
                    f"{sender_full_name}</b>\n")
    msg_text += admin_message.message
    msg_text = msg_text.replace("<br>", "\n")
    attachments = [_ async for _ in admin_message.files.all()]
    for user in users:
        user_tg_ids = [tg_note["tg_id"] async for tg_note in
                       user.telegram_allowed_user.values("tg_id").all()]
        user_tg_ids.extend([
            tg_note["tg_id"] async for tg_note in
            user.telegram_allowed_parent.values("tg_id").all()
        ])
        for tg_id in user_tg_ids:
            try:
                msg_result = await bot.send_message(
                    chat_id=tg_id,
                    text=msg_text,
                    reply_markup=chats_get_answer_message_button(
                        admin_message.id, 2
                    )
                )
                for attachment in attachments:
                    await send_file(tg_id, attachment)
                await add_tg_journal_note(msg_result, user)
            except Exception as e:
                await TgBotJournal.objects.acreate(
                    recipient=user,
                    initiator=admin_message.sender,
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
                initiator=admin_message.sender,
                event=10,
                data={
                    "status": "error",
                    "text": msg_text,
                    "msg_id": None,
                    "errors": ["У пользователя не привязан Telegram"],
                    "attachments": [att.id for att in attachments]
                }
            )
