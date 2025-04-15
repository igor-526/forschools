from dls.celery import app
from homework.models import Homework, HomeworkLog
from profile_management.models import Telegram, NewUser
from profile_management.utils import send_email_message
from tgbot.keyboards.homework import get_homework_notification_menu_buttons
from tgbot.utils import sync_funcs as tg, notification_log_journal
import datetime


@app.task
def notification_teachers_homeworks_unchecked(tz=3, today=False) -> None:
    def collect_homeworks_filter(last_log: HomeworkLog) -> bool:
        if last_log.status != 3:
            return False
        now_dt = datetime.datetime.now()
        if today:
            return last_log.dt.replace(tzinfo=None) < (now_dt - datetime.timedelta(hours=1))
        return last_log.dt.replace(tzinfo=None) < (now_dt - datetime.timedelta(days=1))

    def collect_homeworks_info() -> dict[NewUser: int]:
        homeworks = list(filter(lambda hw: collect_homeworks_filter(hw.get("status")), [
            {"id": hw.id,
             "status": hw.get_status(),
             "teacher": hw.teacher} for hw in
            Homework.objects.select_related("teacher", "listener").filter(teacher__tz=tz).order_by("id")]))
        result = {}
        for hw in homeworks:
            if result.get(hw['teacher']) is None:
                result[hw['teacher']] = 0
            result[hw['teacher']] += 1
        return result

    def notify_telegram(homeworks_info: dict[NewUser: int]):
        for teacher in homeworks_info:
            telegram = Telegram.objects.filter(user__id=teacher.id,
                                               usertype="main").first()
            if not telegram:
                notification_log_journal(teacher, 13, "error", None, None, None,
                                         ["У пользователя не привязан Telegram"])
                continue
            message_text = (f'\u270D\uFE0F <b>Проверьте ДЗ!</b> Ученик ждет проверки ДЗ и вашей ОС\n'
                            f'Количество непроверенных ДЗ - {homeworks_info[teacher]}')
            result = tg.send_tg_message_sync(
                tg_id=telegram.tg_id,
                message=message_text,
                reply_markup=get_homework_notification_menu_buttons()
            )
            notification_log_journal(teacher, 13, result.get('status'), message_text,
                                     result.get('msg_id'), "main", result.get('errors'))

    hw_info = collect_homeworks_info()
    notify_telegram(hw_info)
