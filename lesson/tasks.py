from django.db.models import Q
from dls.celery import app
from profile_management.models import Telegram
from profile_management.utils import send_email_message
from tgbot.keyboards.lessons import get_lesson_place_button
from .models import Lesson
from tgbot.utils import sync_funcs as tg
import datetime
from tgbot.models import TgBotJournal
import logging


@app.task
def notification_listeners_lessons():
    def log_notification(recipient, result_status, msg_text, msg_id, usertype, errors=None):
        if errors is None:
            errors = []
        TgBotJournal.objects.create(
            recipient=recipient,
            event=2,
            data={
                "status": result_status,
                "text": msg_text,
                "msg_id": msg_id,
                "usertype": usertype,
                "errors": errors,
                "attachments": []
            }
        )

    lessons = Lesson.objects.filter(
        status=0,
        date=datetime.date.today(),
        start_time__gt=datetime.datetime.now() + datetime.timedelta(hours=1),
        start_time__lte=datetime.datetime.now() + datetime.timedelta(hours=1, minutes=15)
    )
    logging.log(level=logging.INFO, msg=f'[SOON_LESSONS]Lessons_count: {len(lessons)}')
    for lesson in lessons:
        listeners = lesson.get_listeners()
        teacher = lesson.get_teacher()
        msg = (f"<b>Напоминание о занятии</b>\n"
               f"<b>Сегодня</b> в {lesson.start_time.strftime('%H:%M')} у Вас запланировано занятие с "
               f"преподавателем <b>{lesson.get_teacher()}</b>\n\n")
        rm = None
        for listener in listeners:
            telegram_ids = [{"tg_id": tgnote.tg_id,
                             "usertype": tgnote.usertype} for tgnote
                            in Telegram.objects.filter(user__id=listener.id,
                                                       setting_notifications_lessons_hour=True).all()]
            for telegram in telegram_ids:

                if lesson.place:
                    rm = get_lesson_place_button(url=lesson.place.url,
                                                 place_id=lesson.place.id if lesson.place.conf_id or
                                                                             lesson.place.access_code else None)
                result = tg.send_tg_message_sync(
                    tg_id=telegram.get("tg_id"),
                    message=msg,
                    reply_markup=rm
                )
                logging.log(level=logging.INFO, msg=f'[SOON_LESSONS]\nlesson_id: {lesson.id}\n'
                                                    f'listener_id: {listener.id}\n'
                                                    f'tg_id: {telegram.get("tg_id")}\n'
                                                    f'usertype: {telegram.get("usertype")}\n'
                                                    f'status: {result.get("status")}\n')
                if result.get('status') == 'success':
                    log_notification(listener, 'success', msg, result.get('msg_id'),
                                     telegram.get("usertype"))
                else:
                    log_notification(listener, 'error', msg, None, telegram.get("usertype"),
                                     result.get('errors'))
            if not telegram_ids:
                log_notification(listener, 'error', None, None, None,
                                 ["У пользователя не привязан Telegram"])
            if listener.email and listener.email != '' and listener.setting_notifications_email:
                msg = (f"Напоминание о занятии\n"
                       f"Сегодня в {lesson.start_time.strftime('%H:%M')} у Вас запланировано занятие с "
                       f"преподавателем {lesson.get_teacher()}\n\n")
                if lesson.place:
                    msg += lesson.place.url
                    if lesson.place.conf_id:
                        msg += f'\nID конференции: {lesson.place.conf_id}'
                    if lesson.place.access_code:
                        msg += f'\nКод: {lesson.place.access_code}'
                send_email_message(
                    email=listener.email,
                    message=msg,
                    subject="Напоминание о предстоящем занятии"
                )
        teacher_tg_id = Telegram.objects.filter(user__id=teacher.id,
                                                usertype="main").first()
        msg = (f"Напоминание о занятии\n"
               f"Сегодня в {lesson.start_time.strftime('%H:%M')} у Вас запланировано занятие с "
               f"{'учеником' if len(listeners) == 1 else 'учениками'} "
               f"{', '.join([f'<b>{listener.first_name} {listener.last_name}</b>' for listener in listeners])}\n\n")
        if teacher.email and teacher.email != '' and teacher.setting_notifications_email:
            if lesson.place:
                msg += lesson.place.url
                if lesson.place.conf_id:
                    msg += f'\nID конференции: {lesson.place.conf_id}'
                if lesson.place.access_code:
                    msg += f'\nКод: {lesson.place.access_code}'
            send_email_message(
                email=teacher.email,
                message=msg,
                subject="Напоминание о предстоящем занятии"
            )
        if not teacher_tg_id:
            continue
        if not teacher_tg_id.setting_notifications_lessons_hour:
            continue
        teacher_tg_id = teacher_tg_id.tg_id
        msg = (f"<b>Напоминание о занятии</b>\n"
               f"<b>Сегодня</b> в {lesson.start_time.strftime('%H:%M')} у Вас запланировано занятие с "
               f"{'учеником' if len(listeners) == 1 else 'учениками'} "
               f"{', '.join([f'<b>{listener.first_name} {listener.last_name}</b>' for listener in listeners])}\n\n")
        rm = None
        if lesson.place:
            rm = get_lesson_place_button(url=lesson.place.url,
                                         place_id=lesson.place.id if lesson.place.conf_id or lesson.place.access_code
                                         else None)
        result = tg.send_tg_message_sync(
            tg_id=teacher_tg_id,
            message=msg,
            reply_markup=rm
        )
        logging.log(level=logging.INFO, msg=f'[SOON_LESSONS]\nlesson_id: {lesson.id}\n'
                                            f'teacher_id: {teacher.id}\n'
                                            f'tg_id: {teacher_tg_id}\n'
                                            f'status: {result.get("status")}\n')


@app.task
def notification_listeners_tomorrow_lessons():
    lessons = Lesson.objects.filter(
        status=0,
        date=datetime.date.today() + datetime.timedelta(days=1),
        start_time__gte=datetime.datetime.now(),
        start_time__lte=datetime.datetime.now() + datetime.timedelta(hours=1)
    )
    logging.log(level=logging.INFO, msg=f'[TOMORROW_LESSONS_LISTENERS]Lessons_count: {len(lessons)}')
    for lesson in lessons:
        listeners = lesson.get_listeners()
        for listener in listeners:
            telegram_ids = [{"tg_id": tgnote.tg_id,
                             "usertype": tgnote.usertype} for tgnote
                            in Telegram.objects.filter(user__id=listener.id,
                                                       setting_notifications_lesson_day=True).all()]
            for telegram in telegram_ids:
                msg = (f"<b>Напоминание о занятии</b>\n"
                       f"<b>Завтра</b> в {lesson.start_time.strftime('%H:%M')} у Вас запланировано занятие с "
                       f"преподавателем <b>{lesson.get_teacher()}</b>\n\n")
                result = tg.send_tg_message_sync(
                    tg_id=telegram.get("tg_id"),
                    message=msg
                )
                logging.log(level=logging.INFO, msg=f'[TOMORROW_LESSONS_LISTENERS]\nlesson_id: {lesson.id}\n'
                                                    f'listener_id: {listener.id}\n'
                                                    f'tg_id: {telegram.get("tg_id")}\n'
                                                    f'usertype: {telegram.get("usertype")}\n'
                                                    f'status: {result.get("status")}\n')
                if result.get('status') == 'success':
                    TgBotJournal.objects.create(
                        recipient=listener,
                        event=1,
                        data={
                            "status": "success",
                            "text": msg,
                            "msg_id": result.get('msg_id'),
                            "usertype": telegram.get("usertype"),
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
                            "usertype": telegram.get("usertype"),
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
                        "usertype": None,
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
    logging.log(level=logging.INFO, msg=f'[TOMORROW_LESSONS_TEACHERS]Lessons_count: {len(lessons)}')
    notifications_t = {}
    for lesson in lessons:
        listeners = lesson.get_listeners()
        teacher = lesson.get_teacher()
        teacher_tg_id = Telegram.objects.filter(user__id=teacher.id,
                                                usertype="main",
                                                setting_notifications_lesson_day=True).first()
        if not teacher_tg_id:
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
            continue
        if not teacher_tg_id.setting_notifications_lessons_hour:
            continue
        listeners_str = ', '.join([str(listener) for listener in listeners])
        if notifications_t.get(teacher_tg_id.tg_id):
            notifications_t[teacher_tg_id.tg_id]["msg"] += (f"\n<b>{lesson.start_time.strftime('%H:%M')}-"
                                                            f"{lesson.end_time.strftime('%H:%M')}</b>: {listeners_str}")
        else:
            notifications_t[teacher_tg_id.tg_id] = {"msg": (f"<b>Ваше расписание на завтра:</b>\n"
                                                            f"<b>{lesson.start_time.strftime('%H:%M')}-"
                                                            f"{lesson.end_time.strftime('%H:%M')}</b>: {listeners_str}"),
                                                    "usr_id": teacher.id}
    for tg_id in notifications_t:
        msg_result = tg.send_tg_message_sync(
            tg_id=tg_id,
            message=notifications_t[tg_id]["msg"]
        )
        logging.log(level=logging.INFO, msg=f'[TOMORROW_LESSONS_TEACHERS]\n'
                                            f'tg_id: {tg_id}\n'
                                            f'status: {msg_result.get("status")}\n')
        if msg_result.get("status") == "success":
            TgBotJournal.objects.create(
                recipient_id=notifications_t[tg_id]["usr_id"],
                event=1,
                data={
                    "status": "success",
                    "text": notifications_t[tg_id]["msg"],
                    "msg_id": msg_result.get("msg_id"),
                    "usertype": None,
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
                    "usertype": None,
                    "errors": msg_result.get("errors"),
                    "attachments": []
                }
            )


@app.task
def notification_teachers_lessons_not_passed():
    today = datetime.datetime.today() - datetime.timedelta(days=1)
    lessons = [{"id": lesson.id,
                "name": lesson.name,
                "listeners": lesson.get_listeners(),
                "teacher": lesson.get_teacher(),
                "date": lesson.date} for lesson in
               Lesson.objects.filter(Q(
                   learningphases__learningplan__teacher__is_active=True,
                   status=0,
                   date__lte=today,
                   replace_teacher__isnull=True) | Q(
                   status=0,
                   date__lte=today,
                   replace_teacher__isnull=False
               )).order_by('-date')]
    grouped_lessons = {}
    for lesson in lessons:
        lesson_info = {
                "id": lesson.get("id"),
                "name": lesson.get("name"),
                "listeners": lesson.get("listeners"),
                "date": lesson.get("date")
            }
        if not lesson.get("teacher") in grouped_lessons:
            grouped_lessons[lesson.get("teacher")] = []
        grouped_lessons[lesson.get("teacher")].append(lesson_info)
    for teacher in grouped_lessons:
        teacher_telegram = Telegram.objects.filter(user=teacher).first()
        if not teacher_telegram:
            TgBotJournal.objects.create(
                recipient=teacher,
                event=12,
                data={
                    "status": "error",
                    "text": None,
                    "msg_id": None,
                    "usertype": None,
                    "errors": ["У пользователя не привязан Telegram"],
                    "attachments": []
                }
            )
            continue
        message = "Следующие занятия не проведены:\n"

        for lesson in grouped_lessons[teacher][:15]:
            message += (f"{lesson['name']} "
                        f"({','.join([f'{listener.first_name} {listener.last_name}' for listener in lesson['listeners']])})"
                        f" от {lesson['date'].strftime('%d.%m')}\n")
        if len(grouped_lessons[teacher]) > 15:
            message += f'И ещё {len(grouped_lessons[teacher]) - 15}'
        msg_result = tg.send_tg_message_sync(
            tg_id=teacher_telegram.tg_id,
            message=message
        )
        logging.log(level=logging.INFO, msg=f'[NOT_PASSED_LESSONS]\n'
                                            f'tg_id: {teacher_telegram.tg_id}\n'
                                            f'status: {msg_result.get("status")}\n')
        if msg_result.get("status") == "success":
            TgBotJournal.objects.create(
                recipient_id=teacher_telegram.tg_id,
                event=1,
                data={
                    "status": "success",
                    "text": message,
                    "msg_id": msg_result.get("msg_id"),
                    "usertype": None,
                    "errors": [],
                    "attachments": []
                }
            )
        else:
            TgBotJournal.objects.create(
                recipient_id=teacher_telegram.tg_id,
                event=1,
                data={
                    "status": "error",
                    "text": message,
                    "msg_id": None,
                    "usertype": None,
                    "errors": msg_result.get("errors"),
                    "attachments": []
                }
            )

