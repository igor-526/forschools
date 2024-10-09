from dls.celery import app
from dls.utils import get_tg_id_sync
from .models import Lesson
from tgbot.utils import sync_funcs as tg
import datetime
from tgbot.models import TgBotJournal


@app.task
def notification_listeners_lessons():
    lessons = Lesson.objects.filter(
        status=0,
        date=datetime.date.today(),
        start_time__gt=datetime.datetime.now() + datetime.timedelta(hours=1),
        start_time__lte=datetime.datetime.now() + datetime.timedelta(hours=1, minutes=15)
    )
    for lesson in lessons:
        listeners = lesson.get_listeners()
        for listener in listeners:
            telegram_ids = get_tg_id_sync(listener.id)
            for telegram in telegram_ids:
                msg = (f"<b>Напоминание о занятии</b>\n"
                       f"<b>Сегодня</b> в {lesson.start_time.strftime('%H:%M')} у Вас запланировано занятие с "
                       f"преподавателем <b>{lesson.get_teacher()}</b>\n\n")
                if lesson.place:
                    msg += (f'<a href="{lesson.place.url}">Ссылка на занятие</a>\n'
                            f'<b>Просьба не подключаться заранее</b>')
                result = tg.send_tg_message_sync(
                    tg_id=telegram.get("tg_id"),
                    message=msg
                )
                if result.get('status') == 'success':
                    TgBotJournal.objects.create(
                        recipient=listener,
                        event=2,
                        data={
                            "status": "success",
                            "text": msg,
                            "msg_id": result.get('msg_id'),
                            "errors": [],
                            "attachments": []
                        }
                    )
                else:
                    TgBotJournal.objects.create(
                        recipient=listener,
                        event=2,
                        data={
                            "status": "error",
                            "text": msg,
                            "msg_id": None,
                            "errors": result.get('errors'),
                            "attachments": []
                        }
                    )
            if not telegram_ids:
                TgBotJournal.objects.create(
                    recipient=listener,
                    event=2,
                    data={
                        "status": "error",
                        "text": None,
                        "msg_id": None,
                        "errors": ["У пользователя не привязан Telegram"],
                        "attachments": []
                    }
                )


@app.task
def notification_listeners_tomorrow_lessons():
    lessons = Lesson.objects.filter(
        status=0,
        date=datetime.date.today() + datetime.timedelta(days=1),
        start_time__gte=datetime.datetime.now(),
        start_time__lte=datetime.datetime.now() + datetime.timedelta(hours=1)
    )
    for lesson in lessons:
        listeners = lesson.get_listeners()
        for listener in listeners:
            telegram_ids = get_tg_id_sync(listener.id)
            for telegram in telegram_ids:
                msg = (f"<b>Напоминание о занятии</b>\n"
                       f"<b>Завтра</b> в {lesson.start_time.strftime('%H:%M')} у Вас запланировано занятие с "
                       f"преподавателем <b>{lesson.get_teacher()}</b>\n\n")
                if lesson.place:
                    msg += (f'<a href="{lesson.place.url}">Ссылка на занятие</a>\n'
                            f'<b>Просьба не подключаться заранее</b>')
                result = tg.send_tg_message_sync(
                    tg_id=telegram.get("tg_id"),
                    message=msg
                )
                if result.get('status') == 'success':
                    TgBotJournal.objects.create(
                        recipient=listener,
                        event=1,
                        data={
                            "status": "success",
                            "text": msg,
                            "msg_id": result.get('msg_id'),
                            "errors": [],
                            "attachments": []
                        }
                    )
                else:
                    TgBotJournal.objects.create(
                        recipient=listener,
                        event=1,
                        data={
                            "status": "error",
                            "text": msg,
                            "msg_id": None,
                            "errors": result.get('errors'),
                            "attachments": []
                        }
                    )
            if not telegram_ids:
                TgBotJournal.objects.create(
                    recipient=listener,
                    event=1,
                    data={
                        "status": "error",
                        "text": None,
                        "msg_id": None,
                        "errors": ["У пользователя не привязан Telegram"],
                        "attachments": []
                    }
                )


@app.task
def notification_tomorrow_schedule():
    lessons = Lesson.objects.filter(
        status=0,
        date=datetime.date.today() + datetime.timedelta(days=1),
    )
    notifications_t = {}
    for lesson in lessons:
        listeners = lesson.get_listeners()
        teacher = lesson.get_teacher()
        telegram_t_ids = get_tg_id_sync(teacher.id)
        for telegram_t in telegram_t_ids:
            listeners_str = ', '.join([str(listener) for listener in listeners])
            if notifications_t.get(telegram_t.get("tg_id")):
                notifications_t[telegram_t.get("tg_id")]["msg"] += (f"\n<b>{lesson.start_time.strftime('%H:%M')}-"
                                                             f"{lesson.end_time.strftime('%H:%M')}</b>: {listeners_str}")
            else:
                notifications_t[telegram_t.get("tg_id")] = {"msg": (f"<b>Ваше расписание на завтра:</b>\n"
                                                             f"<b>{lesson.start_time.strftime('%H:%M')}-"
                                                             f"{lesson.end_time.strftime('%H:%M')}</b>: {listeners_str}"),
                                                     "usr_id": teacher.id}
        if not telegram_t_ids:
            TgBotJournal.objects.create(
                recipient=teacher,
                event=1,
                data={
                    "status": "error",
                    "text": None,
                    "msg_id": None,
                    "errors": ["У пользователя не привязан Telegram"],
                    "attachments": []
                }
            )
    for tg_id in notifications_t:
        msg_result = tg.send_tg_message_sync(
            tg_id=tg_id,
            message=notifications_t[tg_id]["msg"]
        )
        if msg_result.get("status") == "success":
            TgBotJournal.objects.create(
                recipient_id=notifications_t[tg_id]["usr_id"],
                event=1,
                data={
                    "status": "success",
                    "text": notifications_t[tg_id]["msg"],
                    "msg_id": msg_result.get("msg_id"),
                    "errors": [],
                    "attachments": []
                }
            )
        else:
            TgBotJournal.objects.create(
                recipient_id=notifications_t[tg_id]["usr_id"],
                event=1,
                data={
                    "status": "error",
                    "text": None,
                    "msg_id": None,
                    "errors": msg_result.get("errors"),
                    "attachments": []
                }
            )
