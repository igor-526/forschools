from datetime import datetime, date, timedelta
import os
from typing import Dict, List

from aiogram.fsm.context import FSMContext
from aiogram.fsm.storage.base import StorageKey
from django.db.models import Q
from chat.models import Message
from dls.settings import MEDIA_ROOT
from lesson.models import Lesson
from profile_management.models import NewUser, Telegram
from homework.models import Homework
from tgbot.create_bot import bot, dp
import async_to_sync as sync

from tgbot.finite_states.homework import HomeworkNewFSM
from tgbot.funcs.fileutils import send_file
from tgbot.funcs.lessons import f_lessons_show_place_access_info
from tgbot.keyboards.lessons import get_lesson_web_button
from tgbot.keyboards.materials import get_materials_keyboard_query
from tgbot.keyboards.homework import get_homeworks_buttons, get_homework_editing_buttons
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

    async def check_unsent_messages(self, notify=True):
        all_users = [{"tg_id": tg_note.tg_id,
                      "full_name": f'{tg_note.user.first_name} {tg_note.user.last_name}'}
                     async for tg_note in
                     Telegram.objects.select_related("user").all()]
        unsent_messages = []
        now = datetime.now()
        for user in all_users:
            state_with: FSMContext = FSMContext(
                storage=dp.storage,
                key=StorageKey(
                    chat_id=user.get("tg_id"),
                    user_id=user.get("tg_id"),
                    bot_id=bot.id))
            state = await state_with.get_state()
            if state == "ChatsFSM:send_message":
                data = await state_with.get_data()
                unsent_messages.append({
                    "user": {
                        "full_name": user.get("full_name"),
                        "tg_id": user.get("tg_id")
                    },
                    "message": "\n".join(data.get("comment")),
                    "start_time": datetime.strptime(data.get("start_time"), '%d.%m.%YT%H:%M')
                    if data.get("start_time") else None,
                    "attachments": len(data.get("files")),
                })
                if notify and data.get("start_time"):
                    st = datetime.strptime(data.get("start_time"), '%d.%m.%YT%H:%M')
                    minutes_ago = (now - st).seconds // 60
                    if minutes_ago > 5:
                        await bot.send_message(chat_id=user.get("tg_id"),
                                               text="Ваше сообщение не отправлено!\nДля отправки необходимо "
                                                    "нажать кнопку <b>ОТПРАВИТЬ</b>")
        return unsent_messages

    async def notify_unsent_data(self):
        all_users = [{"tg_id": tg_note.tg_id,
                      "full_name": f'{tg_note.user.first_name} {tg_note.user.last_name}'}
                     async for tg_note in
                     Telegram.objects.select_related("user").all()]
        now = datetime.now()
        for user in all_users:
            state_with: FSMContext = FSMContext(
                storage=dp.storage,
                key=StorageKey(
                    chat_id=user.get("tg_id"),
                    user_id=user.get("tg_id"),
                    bot_id=bot.id))
            state = await state_with.get_state()
            if state == "ChatsFSM:send_message":
                data = await state_with.get_data()
                if data.get("start_time"):
                    st = datetime.strptime(data.get("start_time"), '%d.%m.%YT%H:%M')
                    minutes_ago = (now - st).seconds // 60
                    if minutes_ago > 5:
                        await bot.send_message(chat_id=user.get("tg_id"),
                                               text="Ваше сообщение не отправлено!\nДля отправки необходимо "
                                                    "нажать кнопку <b>ОТПРАВИТЬ</b>")
            elif state == "HomeworkFSM:send_hw_files":
                data = await state_with.get_data()
                if data.get("start_time"):
                    st = datetime.strptime(data.get("start_time"), '%d.%m.%YT%H:%M')
                    minutes_ago = (now - st).seconds // 60
                    if minutes_ago > 5:
                        await bot.send_message(chat_id=user.get("tg_id"),
                                               text="Ваше ДЗ не отправлено!\nДля отправки необходимо "
                                                    "нажать кнопку <b>ОТПРАВИТЬ</b>")

    async def restore_file(self, file_tg_id, extension: str):
        file = await bot.get_file(file_id=file_tg_id)
        file_path = [MEDIA_ROOT, "telegram", *file.file_path.split("/")[-2:]]
        file_path_new_db = ["telegram", *file.file_path.split("/")[-2:]]
        file_path_new_db[-1] += f'.{extension}'
        file_path_new = os.path.join(MEDIA_ROOT, *file_path_new_db)
        os.rename(os.path.join(*file_path), file_path_new)
        return os.path.join(*file_path_new_db)

    async def add_hw(self, tg_id, lesson_id) -> Dict[str, bool] | Dict[str, str | bool]:
        try:
            lesson = await Lesson.objects.aget(id=lesson_id)
            state: FSMContext = FSMContext(
                storage=dp.storage,
                key=StorageKey(
                    chat_id=tg_id,
                    user_id=tg_id,
                    bot_id=bot.id))

            last_count = await Homework.objects.acount()
            deadline = date.today() + timedelta(days=6)
            plan = await lesson.aget_learning_plan()
            await state.update_data({
                "new_hw": {
                    "hw_id": None,
                    'lesson_id': lesson_id,
                    "name": f'ДЗ {last_count + 1}',
                    "description": None,
                    "materials": [],
                    "deadline": {
                        'day': deadline.day,
                        'month': deadline.month,
                        'year': deadline.year
                    },
                },
                "messages_to_delete": []
            })

            await state.set_state(HomeworkNewFSM.change_menu)
            listeners = await lesson.aget_listeners()
            listeners_str = ', '.join([f'{listener.first_name} {listener.last_name}' for listener in listeners])
            msg_text = (f"Вы задаёте ДЗ к занятию от {lesson.date.strftime('%d.%m')}\n"
                        f"{'Ученик: ' if len(listeners) == 1 else 'Ученики: '}: "
                        f"{listeners_str}")
            if plan.pre_hw_comment:
                msg_text += (f'\n\n<b>Необходимо учесть следующий комментарий:</b>'
                             f'\n{plan.pre_hw_comment}')
            msg_text += ("\n\nПерешлите сюда или прикрепите материал, или напишите сообщение\n"
                         "Когда будет готово, нажмите кнопку <b>'Подтвердить ДЗ'</b>")
            await bot.send_message(chat_id=tg_id,
                                   text=msg_text,
                                   reply_markup=get_homework_editing_buttons())
            return {"status": True}
        except Lesson.DoesNotExist:
            return {"status": False,
                    "error": "Занятие не найдено"}
        except Exception as e:
            print(e)
            return {"status": False,
                    "error": str(e)}

    async def send_lesson_place(self, lesson_id, tg_id) -> Dict[str, bool] | Dict[str, str | bool]:
        try:
            await f_lessons_show_place_access_info(lesson_id, tg_id)
            return {"status": True}
        except Exception as e:
            return {"status": False,
                    "error": str(e)}


sync_funcs = sync.methods(AsyncClass())


async def get_user(tg_id) -> NewUser | None:
    tg_note = await Telegram.objects.filter(tg_id=tg_id).select_related("user").afirst()
    if tg_note:
        return tg_note.user
    else:
        return None


async def get_tg_id(user_id: int, main_one=False):
    if main_one:
        return (await Telegram.objects.filter(user__id=user_id).afirst()).tg_id
    return [tg_id async for tg_id in
            Telegram.objects.filter(
                Q(allowed_users=user_id) |
                Q(allowed_parents=user_id)
            ).values_list("tg_id", flat=True)]


async def get_tg_note(tg_id: int) -> Telegram | None:
    try:
        return await Telegram.objects.select_related("user").aget(tg_id=tg_id)
    except Exception as e:
        return None


async def aget_user_groups(user_id) -> List[str]:
    user = await NewUser.objects.aget(id=user_id)
    groups = [group async for group in
              user.groups.values_list("name", flat=True)]
    return groups


def send_materials(initiator: NewUser, recipient: NewUser, materials, sendtype):
    user_tgs = get_tg_id_sync(recipient.id)
    event = 5 if sendtype == "manual" else 6
    for user_tg in user_tgs:
        msg_result = sync_funcs.send_tg_message_sync(tg_id=user_tg.get("tg_id"),
                                                     message="Вам направлены материалы:",
                                                     reply_markup=get_materials_keyboard_query(materials))
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


def send_homework_tg(initiator: NewUser, listener: NewUser,
                     homeworks: list[Homework], text="У вас новые домашние задания!",
                     tg_id: int = None) -> dict:
    if tg_id:
        tg_ids = [tg_id]
    else:
        tg_ids = get_tg_id_sync(listener.id)
    user_groups = [group.name for group in listener.groups.all()]
    for tg_id in tg_ids:
        msg_result = sync_funcs.send_tg_message_sync(tg_id=tg_id,
                                                     message=text,
                                                     reply_markup=get_homeworks_buttons(
                                                         [{'name': hw.get_tg_name(user_groups),
                                                           'id': hw.id} for hw in homeworks]
                                                     ))
        if msg_result.get("status") == "success":
            TgBotJournal.objects.create(
                recipient=listener,
                initiator=initiator,
                event=3,
                data={
                    "status": "success",
                    "text": text,
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
        user_groups = [group.name for group in recipient.groups.all()]
        msg_result = sync_funcs.send_tg_message_sync(tg_id=user_tg_id,
                                                     message=msg,
                                                     reply_markup=get_homeworks_buttons([{
                                                         'name': homework.get_tg_name(user_groups),
                                                         'id': homework.id
                                                     }]))
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


def notify_group_chat_message(message: Message):
    def notify(tg_ids, text_type="user"):
        msg_text = ""
        if text_type == "user":
            msg_text = f'<b>Новое сообщение из "{group.name}"</b>\n{message.message}'
        elif text_type == "receiver_parent":
            msg_text = f'<b>Новое сообщение ДЛЯ УЧЕНИКА из "{group.name}"</b>\n{message.message}'
        elif text_type == "sender_parent":
            msg_text = f'<b>Новое сообщение ОТ УЧЕНИКА в "{group.name}"</b>\n{message.message}'
        msg_text = msg_text.replace("<br>", "\n")
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
    notify(users_tg_id, 'user')
    notify(receivers_tg_id, 'user')
    notify(receiver_parents_tg_id, 'receiver_parent')
    notify(sender_parents_tg_id, 'sender_parent')


def notify_lesson_passed(tg_id: int,
                         text: str = "Занятие успешно проведено!",
                         lesson_id: int = None):
    rm = None
    if lesson_id:
        rm = get_lesson_web_button(tg_note=None,
                                   lesson_id=lesson_id)
    sync_funcs.send_tg_message_sync(tg_id=tg_id,
                                    message=text,
                                    reply_markup=rm)


def notification_log_journal(recipient: NewUser | int, event: int, result_status: str,
                             msg_text: str | None, msg_id: int | None,
                             usertype: str | None, errors: list | None = None) -> TgBotJournal:
    if errors is None:
        errors = []
    tg_note = TgBotJournal.objects.create(
        recipient=recipient,
        event=event,
        data={
            "status": result_status,
            "text": msg_text,
            "msg_id": msg_id,
            "usertype": usertype,
            "errors": errors,
            "attachments": []
        }
    )
    return tg_note
