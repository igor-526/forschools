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


async def get_tg_id(user: NewUser) -> int | None:
    tg_note = await Telegram.objects.filter(user=user).afirst()
    if tg_note:
        return tg_note.tg_id
    else:
        return None


async def get_group_and_perms(user_id) -> dict:
    user = await NewUser.objects.aget(id=user_id)
    groups = [group.name async for group in user.groups.all()]
    perms = [f"{perm.content_type.app_label}.{perm.codename}"
             async for perm in Permission.objects.select_related("content_type").filter(group__name__in=groups)]
    return {
        "groups": groups,
        "permissions": perms
    }


def send_materials(initiator: NewUser, recipient: NewUser, materials, sendtype) -> dict:
    user_tg = Telegram.objects.filter(user=recipient).first()
    event = 5 if sendtype == "manual" else 6
    if user_tg:
        msg_result = sync_funcs.send_tg_message_sync(tg_id=user_tg.tg_id,
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
        return msg_result
    else:
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
    user_tg_id = get_tg_id_sync(listener)
    if user_tg_id:
        msg_result = sync_funcs.send_tg_message_sync(tg_id=user_tg_id,
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
        return msg_result
    else:
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
    user_tg_id = get_tg_id_sync(user)
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
    if user_tg_id:
        msg_result = sync_funcs.send_tg_message_sync(tg_id=user_tg_id,
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
    else:
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


def send_chat_message(message: Message):
    user_tg_id = get_tg_id_sync(message.receiver)
    if user_tg_id:
        msg_text = (f"<b>Новое сообщение от {message.sender.first_name} "
                    f"{message.sender.last_name}</b>\n{message.message}")
        msg_result = sync_funcs.send_tg_message_sync(tg_id=user_tg_id,
                                                     message=msg_text,
                                                     reply_markup=chats_get_show_message_button(message.id))
        if msg_result.get("status") == "success":
            TgBotJournal.objects.create(
                recipient=message.receiver,
                initiator=message.sender,
                event=7,
                data={
                    "status": "success",
                    "text": msg_text,
                    "msg_id": msg_result.get("msg_id"),
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
                    "errors": msg_result.get("errors"),
                    "attachments": []
                }
            )
        for att in message.files.all():
            sync_funcs.send_tg_file_sync(user_tg_id, att)
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
    sync_funcs.send_tg_message_sync(tg_id=user.telegram.first().tg_id,
                                    message=f"ДЗ '{hw.name}'",
                                    reply_markup=get_homework_edit_button(hw.id))
