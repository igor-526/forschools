import os
from celery import Celery
from celery.schedules import crontab


def generate_notification_schedule(msk_hour: int, task: str, prefix: str = "", today: bool = False,
                                   minute: int = 0) -> dict[str, dict[str, tuple | dict[str, int] | str]]:
    schedule = {}
    for tz in range(-12, 15):
        task_name = f'{prefix}_{task.split(".")[-1]}_{str(tz).replace("-", "m")}'
        local_hour = (msk_hour - 3 + tz) % 24
        schedule[task_name] = {
            'task': task,
            'schedule': crontab(hour=str(local_hour), minute=str(minute)),
            'args': (tz,) if not today else (tz, True)
        }
    return schedule


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dls.settings')
app = Celery('dls')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'notification_lessons_soon': {
        'task': 'lesson.tasks.notification_lessons_soon',
        'schedule': crontab(hour='0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, '
                                 '15, 16, 17, 18, 19, 20, 21, 22, 23',
                            minute='0, 15, 30, 45'),
    },
    'notification_listeners_tomorrow_lessons': {
        'task': 'lesson.tasks.notification_listeners_tomorrow_lessons',
        'schedule': crontab(hour='0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, '
                                 '15, 16, 17, 18, 19, 20, 21, 22, 23',
                            minute='0')
    },
    'notify_unsent_data_task': {
        'task': 'tgbot.tasks.notify_unsent_data_task',
        'schedule': crontab(hour='8, 9, 10, 11, 12, 13, 14, '
                                 '15, 16, 17, 18, 19, 20, 21, 22, 23',
                            minute='0, 20, 40')
    },
}

app.conf.beat_schedule | generate_notification_schedule(msk_hour=9,
                                                        task='lesson.tasks.notification_teachers_lessons_not_passed',
                                                        prefix='mrn',
                                                        today=False,
                                                        minute=0)
app.conf.beat_schedule | generate_notification_schedule(msk_hour=18,
                                                        task='lesson.tasks.notification_teachers_lessons_not_passed',
                                                        prefix='evn',
                                                        today=True,
                                                        minute=0)
app.conf.beat_schedule | generate_notification_schedule(msk_hour=9,
                                                        task='homework.tasks.notification_teachers_homeworks_unchecked',
                                                        prefix='mrn',
                                                        today=False,
                                                        minute=5)
app.conf.beat_schedule | generate_notification_schedule(msk_hour=18,
                                                        task='homework.tasks.notification_teachers_homeworks_unchecked',
                                                        prefix='evn',
                                                        today=True,
                                                        minute=5)
app.conf.beat_schedule | generate_notification_schedule(msk_hour=20,
                                                        task='lesson.tasks.notification_tomorrow_schedule',
                                                        prefix='evn',
                                                        today=False,
                                                        minute=0)
