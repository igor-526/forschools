from django.db.models import Q, QuerySet
from dls.celery import app
from profile_management.models import Telegram, NewUser
from profile_management.utils import send_email_message
from tgbot.keyboards.lessons import get_lesson_place_button
from .models import Lesson
from tgbot.utils import sync_funcs as tg, notification_log_journal
import datetime


@app.task
def notification_lessons_soon() -> None:
    def notify_listeners_telegram(lesson_: Lesson, listeners_: QuerySet, teacher_: NewUser) -> None:
        message_text = (f"<b>Напоминание о занятии</b>\n"
                        f"<b>Сегодня</b> в {lesson_.start_time.strftime('%H:%M')} у Вас запланировано занятие с "
                        f"преподавателем <b>{teacher_}</b>\n\n")
        reply_markup = get_lesson_place_button(lesson_.id) if lesson_.place else None
        for listener in listeners_:
            telegrams = listener.telegram_allowed.all().values("tg_id", "usertype",
                                                               "setting_notifications_lessons_hour")
            if not telegrams:
                notification_log_journal(listener, 2, "error", message_text, None, None,
                                         ["У пользователя не привязан ни один Telegram"])
                continue
            for telegram in telegrams:
                if not telegram.get("setting_notifications_lessons_hour"):
                    notification_log_journal(listener, 2, "error", message_text, None,
                                             telegram.get("usertype"),
                                             ["У пользователя выключены уведомления за час до занятия"])
                    continue
                result = tg.send_tg_message_sync(
                    tg_id=telegram.get("tg_id"),
                    message=message_text if telegram.get("usertype") == "main" else
                    f'{message_text}\n\nУченик: {listener}',
                    reply_markup=reply_markup
                )
                notification_log_journal(listener, 2, result.get('status'), message_text,
                                         result.get('msg_id'), telegram.get("usertype"), result.get('errors'))

    def notify_teacher_telegram(lesson_: Lesson, listeners_: QuerySet, teacher_: NewUser) -> None:
        message_text = (f"Напоминание о занятии\n"
                        f"Сегодня в {lesson.start_time.strftime('%H:%M')} у Вас запланировано занятие с "
                        f"{'учеником ' if len(listeners_) == 1 else 'учениками '}"
                        f"{', '.join([f'<b>{listener.first_name} {listener.last_name}</b>' for listener in listeners_])}")
        reply_markup = get_lesson_place_button(lesson_.id) if lesson_.place else None
        telegram = teacher_.telegram.first()
        if not telegram:
            notification_log_journal(teacher_, 2, "error", message_text, None, None,
                                     ["У пользователя не привязан Telegram"])
            return None
        if not telegram.setting_notifications_lessons_hour:
            notification_log_journal(teacher_, 2, "error", message_text, None,
                                     telegram.usertype,
                                     ["У пользователя выключены уведомления за час до занятия"])
            return None
        result = tg.send_tg_message_sync(
            tg_id=telegram.tg_id,
            message=message_text,
            reply_markup=reply_markup
        )
        notification_log_journal(teacher_, 2, result.get('status'), message_text, result.get('msg_id'),
                                 telegram.usertype, result.get('errors'))

    lessons = Lesson.objects.filter(
        status=0,
        date=datetime.date.today(),
        start_time__gt=datetime.datetime.now() + datetime.timedelta(hours=1),
        start_time__lte=datetime.datetime.now() + datetime.timedelta(hours=1, minutes=15)
    )
    for lesson in lessons:
        listeners = lesson.get_listeners()
        teacher = lesson.get_teacher()
        notify_listeners_telegram(lesson, listeners, teacher)
        notify_teacher_telegram(lesson, listeners, teacher)


@app.task
def notification_listeners_tomorrow_lessons() -> None:
    lessons = Lesson.objects.filter(
        status=0,
        date=datetime.date.today() + datetime.timedelta(days=1),
        start_time__gte=datetime.datetime.now(),
        start_time__lte=datetime.datetime.now() + datetime.timedelta(hours=1)
    )
    for lesson in lessons:
        teacher = lesson.get_teacher()
        listeners = lesson.get_listeners()
        message_text = (f"<b>Напоминание о занятии</b>\n"
                        f"<b>Завтра</b> в {lesson.start_time.strftime('%H:%M')} у Вас запланировано занятие с "
                        f"преподавателем <b>{teacher}</b>\n\n")
        for listener in listeners:
            telegrams = listener.telegram_allowed.all().values("tg_id", "usertype", "setting_notifications_lesson_day")
            if not telegrams:
                notification_log_journal(listener, 2, "error", message_text, None, None,
                                         ["У пользователя не привязан ни один Telegram"])
                continue
            for telegram in telegrams:
                if not telegram.get("setting_notifications_lesson_day"):
                    notification_log_journal(listener, 1, "error", message_text, None,
                                             telegram.get("usertype"),
                                             ["У пользователя выключены уведомления за сутки до занятия"])
                    continue
                result = tg.send_tg_message_sync(
                    tg_id=telegram.get("tg_id"),
                    message=message_text if telegram.get("usertype") == "main" else
                    f'{message_text}\n\nУченик: {listener}',
                )
                notification_log_journal(listener, 1, result.get('status'), message_text,
                                         result.get('msg_id'), telegram.get("usertype"), result.get('errors'))


@app.task
def notification_tomorrow_schedule(tz=3) -> None:
    def collect_schedule_info(lessons_: QuerySet) -> dict[NewUser: dict]:
        result = {}
        for lesson in lessons_:
            teacher = lesson.get_teacher()
            if teacher.tz != tz:
                continue
            telegram = Telegram.objects.filter(user__id=teacher.id,
                                               usertype="main").first()
            if not telegram:
                notification_log_journal(teacher, 1, "error", None, None, None,
                                         ["У пользователя не привязан Telegram"])
                continue
            if not telegram.setting_notifications_lesson_day:
                notification_log_journal(teacher, 1, "error", None, None,
                                         telegram.usertype,
                                         ["У пользователя выключены уведомления за сутки до занятия"])
                continue
            listeners = lesson.get_listeners()
            schedule_string = (f"<b>{lesson.start_time.strftime('%H:%M')}-{lesson.end_time.strftime('%H:%M')}</b>: "
                               f"{', '.join([str(listener) for listener in listeners])}")
            if result.get(teacher) is None:
                result[teacher] = {"tg_id": telegram.tg_id,
                                   "schedule": []}
            result[teacher]["schedule"].append(schedule_string)
        return result

    def notify_telegram(schedule_: dict[NewUser: dict]) -> None:
        for teacher in schedule_:
            message_text = "Ваше расписание на завтра:\n"
            message_text += '\n'.join(schedule_[teacher]['schedule'])
            result = tg.send_tg_message_sync(
                tg_id=schedule_[teacher].get("tg_id"),
                message=message_text
            )
            notification_log_journal(teacher, 1, result.get('status'), message_text,
                                     result.get('msg_id'), "main", result.get('errors'))

    lessons = Lesson.objects.filter(
        status=0,
        date=datetime.date.today() + datetime.timedelta(days=1),
        start_time__isnull=False
    ).order_by('start_time')
    schedule = collect_schedule_info(lessons)
    notify_telegram(schedule)


@app.task
def notification_teachers_lessons_not_passed(tz=3, today=False) -> None:
    def collect_lessons_info() -> dict[NewUser: dict]:
        now_dt = datetime.datetime.now()
        q = Q()
        q |= Q(
            learningphases__learningplan__teacher__is_active=True,
            learningphases__learningplan__teacher__tz=tz,
            status=0,
            date__lte=now_dt - datetime.timedelta(days=1),
            replace_teacher__isnull=True
        )
        q |= Q(
            status=0,
            date__lte=now_dt - datetime.timedelta(days=1),
            replace_teacher__isnull=False,
            replace_teacher__tz=tz
        )
        if today:
            q |= Q(
                learningphases__learningplan__teacher__is_active=True,
                learningphases__learningplan__teacher__tz=tz,
                status=0,
                date=now_dt,
                end_time__lte=(now_dt - datetime.timedelta(hours=1)).time(),
                replace_teacher__isnull=True
            )
            q |= Q(
                status=0,
                date=now_dt,
                end_time__lte=(now_dt - datetime.timedelta(hours=1)).time(),
                replace_teacher__isnull=False,
                replace_teacher__tz=tz
            )
        lessons = [{"id": lesson.id,
                    "name": lesson.name,
                    "listeners": lesson.get_listeners(),
                    "teacher": lesson.get_teacher(),
                    "date": lesson.date} for lesson in
                   Lesson.objects.filter(q).order_by('-date').distinct()]
        result = {}
        for lesson in lessons:
            lesson_info = {
                "id": lesson.get("id"),
                "name": lesson.get("name"),
                "listeners": lesson.get("listeners"),
                "date": lesson.get("date")
            }
            if not lesson.get("teacher") in result:
                result[lesson.get("teacher")] = []
            result[lesson.get("teacher")].append(lesson_info)
        return result

    def notify_telegram(lessons_info_: dict[NewUser: dict]) -> None:
        for teacher in lessons_info_:
            telegram = Telegram.objects.filter(user=teacher).first()
            if not telegram:
                notification_log_journal(teacher, 12, "error", None, None, None,
                                         ["У пользователя не привязан Telegram"])
                continue
            message_text = ("\u203C\uFE0FУ вас остались ученики, которые не получили <b>ДЗ</b>\u203C\uFE0F\n"
                            "Не забывайте отправлять домашнее задание не позднее 12 часов с окончания урока\n\n")
            for lesson in lessons_info_[teacher][:15]:
                message_text += (f"{lesson['name']} "
                                 f"({', '.join([f'{listener.first_name} {listener.last_name}' for listener in lesson['listeners']])})"
                                 f" от {lesson['date'].strftime('%d.%m')}\n")
            if len(lessons_info_[teacher]) > 15:
                message_text += f'И ещё {len(lessons_info_[teacher]) - 15}'
            result = tg.send_tg_message_sync(
                tg_id=telegram.tg_id,
                message=message_text
            )
            notification_log_journal(teacher, 12, result.get('status'), message_text,
                                     result.get('msg_id'), "main", result.get('errors'))

    lessons_info = collect_lessons_info()
    notify_telegram(lessons_info)
