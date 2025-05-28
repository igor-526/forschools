from dls.celery import app
from homework.models import Homework, HomeworkLog
from profile_management.models import Telegram, NewUser
from tgbot.keyboards.homework import get_homework_notification_menu_buttons
from tgbot.utils import sync_funcs as tg, notification_log_journal
import datetime
from django.utils import timezone


@app.task
def notification_teachers_homeworks_unchecked(tz=3, today=False) -> None:
    def collect_homeworks_filter(last_log: HomeworkLog) -> bool:
        if last_log.status != 3:
            return False
        now_dt = datetime.datetime.now()
        if today:
            return (last_log.dt.replace(tzinfo=None) <
                    (now_dt - datetime.timedelta(hours=1)))
        return (last_log.dt.replace(tzinfo=None) <
                (now_dt - datetime.timedelta(days=1)))

    def collect_homeworks_info() -> dict[NewUser: int]:
        homeworks = list(filter(
            lambda hw: collect_homeworks_filter(hw.get("status")), [
                {"id": hw.id,
                 "status": hw.get_status(),
                 "teacher": hw.teacher} for hw in
                Homework.objects.select_related("teacher", "listener")
                .filter(teacher__tz=tz).order_by("id")]
        ))
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
                notification_log_journal(
                    recipient=teacher,
                    event=13,
                    result_status="error",
                    msg_text=None,
                    msg_id=None,
                    usertype=None,
                    errors=["У пользователя не привязан Telegram"]
                )
                continue
            message_text = (f'\u270D\uFE0F <b>Проверьте ДЗ!</b> '
                            f'Ученик ждет проверки ДЗ и вашей ОС\n'
                            f'Количество непроверенных ДЗ - '
                            f'{homeworks_info[teacher]}')
            result = tg.send_tg_message_sync(
                tg_id=telegram.tg_id,
                message=message_text,
                reply_markup=get_homework_notification_menu_buttons(tg_note=telegram)
            )
            notification_log_journal(recipient=teacher,
                                     event=13,
                                     result_status=result.get('status'),
                                     msg_text=message_text,
                                     msg_id=result.get('msg_id'),
                                     usertype="main",
                                     errors=result.get('errors'))

    hw_info = collect_homeworks_info()
    notify_telegram(hw_info)


@app.task
def notification_methodists_homeworks_unaccepted(tz=3, today=False) -> None:
    def collect_methodists_info():
        query = {
            "agreement__accepted": False,
            "homework__lesson__learningphases__learningplan__metodist__tz": tz
        }
        if today:
            query["dt__lte"] = timezone.now() - timezone.timedelta(hours=1)
        else:
            query["dt__date__lte"] = datetime.datetime.now() - datetime.timedelta(days=1)
        homeworks = HomeworkLog.objects.filter(
            **query
        ).values_list("homework__id",
                      "homework__name",
                      "homework__listener__first_name",
                      "homework__listener__last_name",
                      "homework__lesson__date",
                      "homework__lesson__learningphases__learningplan__metodist__id",
                      "homework__lesson__learningphases__learningplan__metodist__telegram__tg_id",
                      "homework__lesson__learningphases__learningplan__metodist__telegram__access_token",
                      named=True)
        methodists_info_ = {}
        for hw in homeworks:
            if hw.homework__lesson__learningphases__learningplan__metodist__id not in methodists_info_:
                methodists_info_[hw.homework__lesson__learningphases__learningplan__metodist__id] = {
                    "hw": [],
                    "tg_id": hw.homework__lesson__learningphases__learningplan__metodist__telegram__tg_id,
                    "access_token": hw.homework__lesson__learningphases__learningplan__metodist__telegram__access_token
                }
            methodists_info_[hw.homework__lesson__learningphases__learningplan__metodist__id]["hw"].append(hw)
        return methodists_info_

    methodists_info = collect_methodists_info()
    for methodist in methodists_info:
        message_text = "У вас не согласованы следующие ДЗ:\n\n"
        message_text += "\n".join(
            [f'{hw_info.homework__name} ({hw_info.homework__listener__first_name} '
             f'{hw_info.homework__listener__last_name}) от '
             f'{hw_info.homework__lesson__date.strftime("%d.%m")}' for
             hw_info in methodists_info[methodist]["hw"][:10]])
        if len(methodists_info[methodist]["hw"]) > 10:
            message_text += f'\n\nИ ещё {len(methodists_info[methodist]["hw"]) - 10}'
        if not methodists_info[methodist]["tg_id"]:
            notification_log_journal(recipient=methodist,
                                     event=14,
                                     result_status="error",
                                     msg_text=message_text,
                                     msg_id=None,
                                     usertype="main",
                                     errors=["У пользователя не привязан Telegram"])
            break
        result = tg.send_tg_message_sync(
            tg_id=methodists_info[methodist]["tg_id"],
            message=message_text,
            reply_markup=get_homework_notification_menu_buttons(access_token=[methodist]["access_token"])
        )
        notification_log_journal(recipient=methodist,
                                 event=14,
                                 result_status=result.get('status'),
                                 msg_text=message_text,
                                 msg_id=result.get('msg_id'),
                                 usertype="main",
                                 errors=result.get('errors'))
