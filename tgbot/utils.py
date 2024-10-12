from django.db.models import Count, Q

from chat.models import Message
from profile_management.models import NewUser, Telegram
from homework.models import Homework
from django.contrib.auth.models import Permission
from tgbot.create_bot import bot
import async_to_sync as sync
from tgbot.funcs.fileutils import send_file
from tgbot.keyboards.chats import chats_get_show_message_button
from tgbot.keyboards.materials import get_keyboard_query
from tgbot.keyboards.homework import get_homeworks_buttons, get_homework_edit_button
from dls.utils import get_tg_id_sync
from tgbot.models import TgBotJournal


class AsyncClass:
    async def send_tg_message_sync(self, tg_id, message, reply_markup=None) -> dict:
        try:
            msg = await bot.send_message(chat_id=tg_id, text=message, reply_markup=reply_markup)
            return {'status': 'success', 'errors': [], 'msg_id': msg.message_id}
        except Exception as e:
            return {'status': 'error', 'errors': [str(e)], 'msg_id': None}

    async def send_tg_file_sync(self, tg_id, file_object):
        await send_file(tg_id, file_object)


sync_funcs = sync.methods(AsyncClass())


async def get_user(tg_id) -> NewUser or None:
    tg_note = await Telegram.objects.filter(tg_id=tg_id).select_related("user").afirst()
    if tg_note:
        return tg_note.user
    else:
        return None


async def get_tg_id(user_id: int, usertype=None):
    if usertype:
        tg_note = await Telegram.objects.filter(usertype=usertype, user__id=user_id).afirst()
        return tg_note.tg_id
    tg_ids = [{
        "tg_id": tgnote.tg_id,
        "usertype": tgnote.usertype
    } async for tgnote in Telegram.objects.filter(user__id=user_id).all()]
    return tg_ids


async def get_group_and_perms(user_id) -> dict:
    user = await NewUser.objects.aget(id=user_id)
    groups = [group.name async for group in user.groups.all()]
    perms = [f"{perm.content_type.app_label}.{perm.codename}"
             async for perm in Permission.objects.select_related("content_type").filter(group__name__in=groups)]
    return {
        "groups": groups,
        "permissions": perms
    }


def send_materials(initiator: NewUser, recipient: NewUser, materials, sendtype):
    user_tgs = get_tg_id_sync(recipient.id)
    event = 5 if sendtype == "manual" else 6
    for user_tg in user_tgs:
        msg_result = sync_funcs.send_tg_message_sync(tg_id=user_tg.get("tg_id"),
                                                     message="Вам направлены материалы:",
                                                     reply_markup=get_keyboard_query(materials))
        if msg_result.get("status") == "success":
            TgBotJournal.objects.create(
                recipient=recipient,
                initiator=initiator,
                event=event,
                data={
                    "status": "success",
                    "text": "Вам направлены материалы:",
                    "msg_id": msg_result.get("msg_id"),
                    "errors": [],
                    "attachments": []
                }
            )
        else:
            TgBotJournal.objects.create(
                recipient=recipient,
                initiator=initiator,
                event=event,
                data={
                    "status": "error",
                    "text": None,
                    "msg_id": None,
                    "errors": msg_result.get("errors"),
                    "attachments": []
                }
            )
    if not user_tgs:
        TgBotJournal.objects.create(
            recipient=recipient,
            initiator=initiator,
            event=event,
            data={
                "status": "error",
                "text": None,
                "msg_id": None,
                "errors": ["У пользователя не привязан Telegram"],
                "attachments": []
            }
        )


def send_homework_tg(initiator: NewUser, listener: NewUser, homeworks: list[Homework]) -> dict:
    tg_ids = get_tg_id_sync(listener.id)
    for tg_id in tg_ids:
        msg_result = sync_funcs.send_tg_message_sync(tg_id=tg_id.get("tg_id"),
                                                     message=f"У вас новые домашние задания!",
                                                     reply_markup=get_homeworks_buttons([hw for hw in homeworks]))
        if msg_result.get("status") == "success":
            TgBotJournal.objects.create(
                recipient=listener,
                initiator=initiator,
                event=3,
                data={
                    "status": "success",
                    "text": "У вас новые домашние задания!",
                    "msg_id": msg_result.get("msg_id"),
                    "errors": [],
                    "attachments": []
                }
            )
        else:
            TgBotJournal.objects.create(
                recipient=listener,
                initiator=initiator,
                event=3,
                data={
                    "status": "error",
                    "text": None,
                    "msg_id": None,
                    "errors": msg_result.get("errors"),
                    "attachments": []
                }
            )
    if not tg_ids:
        TgBotJournal.objects.create(
            recipient=listener,
            initiator=initiator,
            event=3,
            data={
                "status": "error",
                "text": None,
                "msg_id": None,
                "errors": ["У пользователя не привязан Telegram"],
                "attachments": []
            }
        )
        return {"status": "error",
                "errors": "not found"}


def send_homework_answer_tg(user: NewUser, homework: Homework, status: int) -> dict:
    user_tg_ids = get_tg_id_sync(user.id)
    msg = None
    initiator = None
    recipient = None
    if status == 3:
        msg = f"Пришёл новый ответ от ученика по ДЗ <b>'{homework.name}'</b>"
        initiator = homework.listener
        recipient = homework.teacher
    elif status in [4, 5]:
        msg = f"Пришёл новый ответ от преподавателя по ДЗ <b>'{homework.name}'</b>"
        initiator = homework.teacher
        recipient = homework.listener
    for user_tg_id in user_tg_ids:
        msg_result = sync_funcs.send_tg_message_sync(tg_id=user_tg_id.get("tg_id"),
                                                     message=msg,
                                                     reply_markup=get_homeworks_buttons([homework]))
        if msg_result.get("status") == "success":
            TgBotJournal.objects.create(
                recipient=recipient,
                initiator=initiator,
                event=4,
                data={
                    "status": "success",
                    "text": msg,
                    "msg_id": msg_result.get("msg_id"),
                    "errors": [],
                    "attachments": []
                }
            )
        else:
            TgBotJournal.objects.create(
                recipient=recipient,
                initiator=initiator,
                event=4,
                data={
                    "status": "error",
                    "text": None,
                    "msg_id": None,
                    "errors": msg_result.get("errors"),
                    "attachments": []
                }
            )
        return msg_result
    if not user_tg_ids:
        TgBotJournal.objects.create(
            recipient=recipient,
            initiator=initiator,
            event=4,
            data={
                "status": "error",
                "text": None,
                "msg_id": None,
                "errors": ["У пользователя не привязан Telegram"],
                "attachments": []
            }
        )


def notificate_group_chat_message(message: Message):
    def notificate(tg_ids, text_type="user"):
        msg_text = ""
        if text_type == "user":
            msg_text = f'<b>Новое сообщение из "{group.name}"</b>\n{message.message}'
        elif text_type == "receiver_parent":
            msg_text = f'<b>Новое сообщение ДЛЯ УЧЕНИКА из "{group.name}"</b>\n{message.message}'
        elif text_type == "sender_parent":
            msg_text = f'<b>Новое сообщение ОТ УЧЕНИКА в "{group.name}"</b>\n{message.message}'
        for tg_id in tg_ids:
            msg_result = sync_funcs.send_tg_message_sync(tg_id=tg_id,
                                                         message=msg_text)
            for att in attachments:
                sync_funcs.send_tg_file_sync(tg_id, att)

    group = message.group_chats_messages.first()
    users_tg_id = [tgnote.tg_id for tgnote in group.users_tg.all()]
    receiver_parents_tg_id = [tgnote.tg_id for tgnote in
                              Telegram.objects.filter(user__in=group.users.exclude(id=message.sender.id))
                              .exclude(Q(usertype="main") | Q(tg_id__in=users_tg_id))]
    sender_parents_tg_id = [tgnote.tg_id for tgnote in message.sender.telegram.exclude(usertype="main")]
    receivers_tg_id = [tgnote.tg_id for tgnote in
                       Telegram.objects.filter(user__in=group.users.exclude(id=message.sender.id), usertype="main")]
    attachments = message.files.all()
    notificate(users_tg_id, 'user')
    notificate(receivers_tg_id, 'user')
    notificate(receiver_parents_tg_id, 'receiver_parent')
    notificate(sender_parents_tg_id, 'sender_parent')





def notificate_chat_message(message: Message):
    def add_tgjournal_note(result):
        if result.get("status") == "success":
            TgBotJournal.objects.create(
                recipient=message.receiver,
                initiator=message.sender,
                event=7,
                data={
                    "status": "success",
                    "text": msg_text,
                    "msg_id": result.get("msg_id"),
                    "errors": [],
                    "attachments": []
                }
            )
        else:
            TgBotJournal.objects.create(
                recipient=message.receiver,
                initiator=message.sender,
                event=7,
                data={
                    "status": "error",
                    "text": None,
                    "msg_id": None,
                    "errors": result.get("errors"),
                    "attachments": []
                }
            )

    def notificate_parents():
        if message.sender:
            if message.receiver:
                receiver_fullname = f'{message.receiver.first_name} {message.receiver.last_name}'
            else:
                receiver_fullname = (f'{message.receiver_tg.user.first_name} {message.receiver_tg.user.last_name}'
                                     f'({message.receiver_tg.usertype})')
            parents = Telegram.objects.filter(user=message.sender).exclude(usertype="main")
            parent_msg_text = (f"<b>Новое сообщение <b>ОТ УЧЕНИКА ДЛЯ</b> {receiver_fullname}"
                               f" [{message.date.strftime('%d.%m %H:%M')}]</b>:\n"
                               f"{message.message}")
            parent_msg_text = parent_msg_text.replace("<br>", "\n")
            for p_tg_note in parents:
                sync_funcs.send_tg_message_sync(tg_id=p_tg_note.tg_id,
                                                message=parent_msg_text)
                for attachment in message.files.all():
                    sync_funcs.send_tg_file_sync(tg_id, attachment)

    user_tg_id = None
    parents_tg_ids = []
    if message.receiver:
        user_tg_id = get_tg_id_sync(message.receiver.id, "main")
        parents_tg_ids = [
            tgnote.tg_id for tgnote in Telegram.objects.filter(user_id=message.receiver.id).exclude(usertype="main")
        ]
    elif message.receiver_tg:
        user_tg_id = message.receiver_tg.tg_id
    if user_tg_id:
        msg_text = (f"<b>Новое сообщение от {message.sender.first_name} "
                    f"{message.sender.last_name}</b>\n{message.message}")
        msg_result = sync_funcs.send_tg_message_sync(tg_id=user_tg_id,
                                                     message=msg_text)
        add_tgjournal_note(msg_result)
        notificate_parents()
        for parent_tg_id in parents_tg_ids:
            msg_text = (f"<b>Новое сообщение ДЛЯ УЧЕНИКА от {message.sender.first_name} "
                        f"{message.sender.last_name}</b>\n{message.message}")
            msg_result = sync_funcs.send_tg_message_sync(tg_id=parent_tg_id,
                                                         message=msg_text)
            add_tgjournal_note(msg_result)
        for att in message.files.all():
            for tg_id in [user_tg_id, *parents_tg_ids]:
                sync_funcs.send_tg_file_sync(tg_id, att)
    else:
        TgBotJournal.objects.create(
            recipient=message.receiver,
            initiator=message.sender,
            event=7,
            data={
                "status": "error",
                "text": None,
                "msg_id": None,
                "errors": ["У пользователя не привязан Telegram"],
                "attachments": []
            }
        )


def send_homework_edit(hw: Homework, user: NewUser):
    sync_funcs.send_tg_message_sync(tg_id=user.telegram.filter(usertype="main").first().tg_id,
                                    message=f"ДЗ '{hw.name}'",
                                    reply_markup=get_homework_edit_button(hw.id))
