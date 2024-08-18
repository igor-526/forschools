from dls.celery import app
from .models import Lesson
from tgbot.utils import sync_funcs as tg
import datetime


@app.task
def notification_listeners_lessons():
    lessons = Lesson.objects.filter(
        status=0,
        date=datetime.date.today(),
        start_time__gte=datetime.datetime.now() + datetime.timedelta(minutes=5),
        start_time__lte=datetime.datetime.now() + datetime.timedelta(hours=1, minutes=5)
    )
    for lesson in lessons:
        listeners = lesson.get_listeners()
        for listener in listeners:
            telegram = listener.telegram.first()
            if telegram:
                msg = (f"<b>Напоминание о занятии</b>\n"
                       f"Сегодня в {lesson.start_time.strftime('%H:%M')} у Вас запланировано занятие с "
                       f"преподавателем <b>{lesson.get_teacher()}</b>\n\n")
                if lesson.place:
                    msg += (f'<a href="{lesson.place.url}">Ссылка на занятие</a>\n'
                            f'<b>Просьба не подключаться заранее</b>')
                tg.send_tg_message_sync(
                    tg_id=telegram.tg_id,
                    message=msg
                )


@app.task
def notification_tomorrow_schedule():
    lessons = Lesson.objects.filter(
        status=0,
        date=datetime.date.today() + datetime.timedelta(days=1),
    )
    notifications_l = {}
    notifications_t = {}
    for lesson in lessons:
        listeners = lesson.get_listeners()
        teacher = lesson.get_teacher()
        for listener in listeners:
            telegram_l = listener.telegram.first()
            if telegram_l:
                if notifications_l.get(telegram_l.tg_id):
                    notifications_l[telegram_l.tg_id] += (f"\n<b>{lesson.start_time.strftime('%H:%M')}-"
                                                          f"{lesson.end_time.strftime('%H:%M')}</b>: {teacher}")
                else:
                    notifications_l[telegram_l.tg_id] = (f"<b>Завтра запланированы следующие занятия:</b>\n"
                                                         f"<b>{lesson.start_time.strftime('%H:%M')}-"
                                                         f"{lesson.end_time.strftime('%H:%M')}</b>: {teacher}")
        telegram_t = teacher.telegram.first()
        if telegram_t:
            listeners_str = ', '.join([str(listener) for listener in listeners])
            if notifications_t.get(telegram_t.tg_id):
                notifications_t[telegram_t.tg_id] += (f"\n<b>{lesson.start_time.strftime('%H:%M')}-"
                                                      f"{lesson.end_time.strftime('%H:%M')}</b>: {listeners_str}")
            else:
                notifications_t[telegram_t.tg_id] = (f"<b>Ваше расписание на завтра:</b>\n"
                                                     f"<b>{lesson.start_time.strftime('%H:%M')}-"
                                                     f"{lesson.end_time.strftime('%H:%M')}</b>: {listeners_str}")
    for tg_id in notifications_l:
        tg.send_tg_message_sync(
            tg_id=tg_id,
            message=notifications_l[tg_id]
        )
    for tg_id in notifications_t:
        tg.send_tg_message_sync(
            tg_id=tg_id,
            message=notifications_t[tg_id]
        )
