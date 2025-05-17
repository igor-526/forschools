from celery import shared_task
from django.db.models import Q, QuerySet, Count
from datetime import datetime, date, timedelta
from django.utils import timezone
from dls.celery import app
from download_data.models import GenerateFilesTasks
from download_data.utils import ExcelFileMaker
from learning_plan.models import LearningPlan
from profile_management.models import Telegram, NewUser
from tgbot.keyboards.lessons import get_lesson_place_button
from .models import Lesson
from tgbot.utils import sync_funcs as tg, notification_log_journal
import datetime


@app.task
def notification_lessons_soon() -> None:
    def notify_listeners_telegram(lesson_: Lesson,
                                  listeners_: QuerySet,
                                  teacher_: NewUser) -> None:
        message_text = (f"<b>Напоминание о занятии</b>\n"
                        f"<b>Сегодня</b> в "
                        f"{lesson_.start_time.strftime('%H:%M')} "
                        f"у Вас запланировано занятие с "
                        f"преподавателем <b>{teacher_}</b>\n\n")
        reply_markup = get_lesson_place_button(lesson_.id) if lesson_.place \
            else None
        for listener in listeners_:
            telegrams = Telegram.objects.filter(Q(allowed_users=listener) | Q(allowed_parents=listener)).values(
                "tg_id", "usertype",
                "setting_notifications_lessons_hour"
            )
            if not telegrams:
                notification_log_journal(
                    recipient=listener,
                    event=2,
                    result_status="error",
                    msg_text=message_text,
                    msg_id=None,
                    usertype=None,
                    errors=["У пользователя не привязан ни один Telegram"]
                )
                continue
            for telegram in telegrams:
                if not telegram.get("setting_notifications_lessons_hour"):
                    notification_log_journal(
                        recipient=listener,
                        event=2,
                        result_status="error",
                        msg_text=message_text,
                        msg_id=None,
                        usertype=telegram.get("usertype"),
                        errors=["У пользователя выключены уведомления за "
                                "час до занятия"]
                    )
                    continue
                result = tg.send_tg_message_sync(
                    tg_id=telegram.get("tg_id"),
                    message=message_text if telegram.get("usertype") == "main"
                    else f'{message_text}\n\nУченик: {listener}',
                    reply_markup=reply_markup
                )
                notification_log_journal(recipient=listener,
                                         event=2,
                                         result_status=result.get('status'),
                                         msg_text=message_text,
                                         msg_id=result.get('msg_id'),
                                         usertype=telegram.get("usertype"),
                                         errors=result.get('errors'))

    def notify_teacher_telegram(lesson_: Lesson,
                                listeners_: QuerySet,
                                teacher_: NewUser) -> None:
        message_text = (
            f"Напоминание о занятии\n"
            f"Сегодня в {lesson.start_time.strftime('%H:%M')} у Вас "
            f"запланировано занятие с "
            f"{'учеником ' if len(listeners_) == 1 else 'учениками '}"
            f"{', '.join([f'<b>{listener.first_name} {listener.last_name}</b>' for listener in listeners_])}"
        )
        reply_markup = get_lesson_place_button(lesson_.id) if lesson_.place \
            else None
        telegram = teacher_.telegram.first()
        if not telegram:
            notification_log_journal(
                recipient=teacher_,
                event=2,
                result_status="error",
                msg_text=message_text,
                msg_id=None,
                usertype=None,
                errors=["У пользователя не привязан Telegram"]
            )
            return None
        if not telegram.setting_notifications_lessons_hour:
            notification_log_journal(
                recipient=teacher_,
                event=2,
                result_status="error",
                msg_text=message_text,
                msg_id=None,
                usertype=telegram.usertype,
                errors=["У пользователя выключены уведомления за час "
                        "до занятия"]
            )
            return None
        result = tg.send_tg_message_sync(
            tg_id=telegram.tg_id,
            message=message_text,
            reply_markup=reply_markup
        )
        notification_log_journal(
            recipient=teacher_,
            event=2,
            result_status=result.get('status'),
            msg_text=message_text,
            msg_id=result.get('msg_id'),
            usertype=telegram.usertype,
            errors=result.get('errors')
        )

    lessons = Lesson.objects.filter(
        status=0,
        date=datetime.date.today(),
        start_time__gt=(datetime.datetime.now() +
                        datetime.timedelta(hours=1)),
        start_time__lte=(datetime.datetime.now() +
                         datetime.timedelta(hours=1, minutes=15))
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
                        f"<b>Завтра</b> в "
                        f"{lesson.start_time.strftime('%H:%M')} у Вас "
                        f"запланировано занятие с "
                        f"преподавателем <b>{teacher}</b>\n\n")
        for listener in listeners:
            telegrams = Telegram.objects.filter(Q(allowed_users=listener) | Q(allowed_parents=listener)).values(
                "tg_id", "usertype", "setting_notifications_lesson_day"
            )
            if not telegrams:
                notification_log_journal(
                    recipient=listener,
                    event=2,
                    result_status="error",
                    msg_text=message_text,
                    msg_id=None,
                    usertype=None,
                    errors=["У пользователя не привязан ни "
                            "один Telegram"]
                )
                continue
            for telegram in telegrams:
                if not telegram.get("setting_notifications_lesson_day"):
                    notification_log_journal(
                        recipient=listener,
                        event=1,
                        result_status="error",
                        msg_text=message_text,
                        msg_id=None,
                        usertype=telegram.get("usertype"),
                        errors=["У пользователя выключены уведомления "
                                "за сутки до занятия"]
                    )
                    continue
                result = tg.send_tg_message_sync(
                    tg_id=telegram.get("tg_id"),
                    message=message_text if
                    telegram.get("usertype") == "main" else
                    f'{message_text}\n\nУченик: {listener}',
                )
                notification_log_journal(
                    recipient=listener,
                    event=1,
                    result_status=result.get('status'),
                    msg_text=message_text,
                    msg_id=result.get('msg_id'),
                    usertype=telegram.get("usertype"),
                    errors=result.get('errors')
                )


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
                notification_log_journal(
                    recipient=teacher,
                    event=1,
                    result_status="error",
                    msg_text=None,
                    msg_id=None,
                    usertype=None,
                    errors=["У пользователя не привязан Telegram"]
                )
                continue
            if not telegram.setting_notifications_lesson_day:
                notification_log_journal(
                    recipient=teacher,
                    event=1,
                    result_status="error",
                    msg_text=None,
                    msg_id=None,
                    usertype=telegram.usertype,
                    errors=["У пользователя выключены уведомления за "
                            "сутки до занятия"])
                continue
            listeners = lesson.get_listeners()
            schedule_string = (
                f"<b>{lesson.start_time.strftime('%H:%M')}-"
                f"{lesson.end_time.strftime('%H:%M')}</b>: "
                f"{', '.join([str(listener) for listener in listeners])}"
            )
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
            notification_log_journal(
                recipient=teacher,
                event=1,
                result_status=result.get('status'),
                msg_text=message_text,
                msg_id=result.get('msg_id'),
                usertype="main",
                errors=result.get('errors')
            )

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
                notification_log_journal(
                    recipient=teacher,
                    event=12,
                    result_status="error",
                    msg_text=None,
                    msg_id=None,
                    usertype=None,
                    errors=["У пользователя не привязан Telegram"]
                )
                continue
            message_text = ("\u203C\uFE0FУ вас остались ученики, которые "
                            "не получили <b>ДЗ</b>\u203C\uFE0F\n"
                            "Не забывайте отправлять домашнее задание не "
                            "позднее 12 часов с окончания урока\n\n")
            for lesson in lessons_info_[teacher][:15]:
                message_text += (
                    f"{lesson['name']} "
                    f"({', '.join([f'{listener.first_name} {listener.last_name}' for listener in lesson['listeners']])})"
                    f" от {lesson['date'].strftime('%d.%m')}\n"
                )
            if len(lessons_info_[teacher]) > 15:
                message_text += f'И ещё {len(lessons_info_[teacher]) - 15}'
            result = tg.send_tg_message_sync(
                tg_id=telegram.tg_id,
                message=message_text
            )
            notification_log_journal(
                recipient=teacher,
                event=12,
                result_status=result.get('status'),
                msg_text=message_text,
                msg_id=result.get('msg_id'),
                usertype="main",
                errors=result.get('errors')
            )

    lessons_info = collect_lessons_info()
    notify_telegram(lessons_info)


class LessonsDataCreator:
    queryset: QuerySet | None
    filter_query: {}
    fields_ru = []
    data = []

    def __init__(self, filter_query: dict, fields: list):
        self.filter_query = filter_query
        self.queryset = None
        self.get_queryset()
        self.set_fields_ru(fields)
        if self.queryset is not None:
            for lesson in self.queryset:
                lesson_info = {}
                learning_plan = lesson.get_learning_plan()
                hw_info = [hw.get_status() for hw in lesson.homeworks.all()]
                if "name_plan" in fields:
                    lesson_info["Наименование (план обучения)"] = (
                        self.get_field_name_plan_value(lesson)
                    )
                if "name_fact" in fields:
                    lesson_info["Наименование (фактическое)"] = (
                        self.get_field_name_fact_value(lesson)
                    )
                if "date" in fields:
                    lesson_info["Дата"] = (
                        self.get_field_date_value(lesson)
                    )
                if "time" in fields:
                    lesson_info["Время"] = (
                        self.get_field_time_value(lesson)
                    )
                if "teacher" in fields:
                    lesson_info["Преподаватель"] = (
                        self.get_field_teacher_value(lesson)
                    )
                if "listeners" in fields:
                    lesson_info["Ученики"] = (
                        self.get_field_listeners_value(lesson)
                    )
                if "methodist" in fields:
                    lesson_info["Методист"] = (
                        self.get_field_methodist_value(learning_plan)
                    )
                if "curators" in fields:
                    lesson_info["Кураторы"] = (
                        self.get_field_curators_value(learning_plan)
                    )
                if "status" in fields:
                    lesson_info["Статус"] = (
                        self.get_field_status_value(lesson)
                    )
                if "review_materials" in fields:
                    lesson_info["Ревью (Материалы)"] = (
                        self.get_field_review_materials_value(lesson)
                    )
                if "review_lexis" in fields:
                    lesson_info["Ревью (Лексика)"] = (
                        self.get_field_review_lexis_value(lesson)
                    )
                if "review_grammar" in fields:
                    lesson_info["Ревью (Грамматика)"] = (
                        self.get_field_review_grammar_value(lesson)
                    )
                if "review_note" in fields:
                    lesson_info["Ревью (Примечание)"] = (
                        self.get_field_review_note_value(lesson)
                    )
                if "review_org" in fields:
                    lesson_info["Ревью (Орг. моменты и поведение ученика)"] = (
                        self.get_field_review_org_value(lesson)
                    )
                if "review_dt" in fields:
                    lesson_info["Ревью (Дата и время заполнения)"] = (
                        self.get_field_review_dt_value(lesson)
                    )
                if "admin_comment" in fields:
                    lesson_info["Комментарий администратора"] = (
                        self.get_field_admin_comment_value(lesson)
                    )
                if "hw_all" in fields:
                    lesson_info["ДЗ (общее количество)"] = (
                        self.get_field_hw_all_value(hw_info)
                    )
                if "hw_agreement" in fields:
                    lesson_info["ДЗ (ожидает согласования)"] = (
                        self.get_field_hw_agreement_value(hw_info)
                    )
                if "hw_processing" in fields:
                    lesson_info["ДЗ (ожидает выполнения)"] = (
                        self.get_field_hw_processing_value(hw_info)
                    )
                if "hw_checking" in fields:
                    lesson_info["ДЗ (ожидает проверки)"] = (
                        self.get_field_hw_checking_value(hw_info)
                    )
                if "hw_accepted" in fields:
                    lesson_info["ДЗ (принято)"] = (
                        self.get_field_hw_accepted_value(hw_info)
                    )
                self.data.append(lesson_info)

    def set_fields_ru(self, fields: list):
        if "name_plan" in fields:
            self.fields_ru.append("Наименование (план обучения)")
        if "name_fact" in fields:
            self.fields_ru.append("Наименование (фактическое)")
        if "date" in fields:
            self.fields_ru.append("Дата")
        if "time" in fields:
            self.fields_ru.append("Время")
        if "teacher" in fields:
            self.fields_ru.append("Преподаватель")
        if "listeners" in fields:
            self.fields_ru.append("Ученики")
        if "methodist" in fields:
            self.fields_ru.append("Методист")
        if "curators" in fields:
            self.fields_ru.append("Кураторы")
        if "status" in fields:
            self.fields_ru.append("Статус")
        if "review_materials" in fields:
            self.fields_ru.append("Ревью (Материалы)")
        if "review_lexis" in fields:
            self.fields_ru.append("Ревью (Лексика)")
        if "review_grammar" in fields:
            self.fields_ru.append("Ревью (Грамматика)")
        if "review_note" in fields:
            self.fields_ru.append("Ревью (Примечание)")
        if "review_org" in fields:
            self.fields_ru.append("Ревью (Орг. моменты и поведение ученика)")
        if "review_dt" in fields:
            self.fields_ru.append("Ревью (Дата и время заполнения)")
        if "admin_comment" in fields:
            self.fields_ru.append("Комментарий администратора")
        if "hw_all" in fields:
            self.fields_ru.append("ДЗ (общее количество)")
        if "hw_agreement" in fields:
            self.fields_ru.append("ДЗ (ожидает согласования)")
        if "hw_processing" in fields:
            self.fields_ru.append("ДЗ (ожидает выполнения)")
        if "hw_checking" in fields:
            self.fields_ru.append("ДЗ (ожидает проверки)")
        if "hw_accepted" in fields:
            self.fields_ru.append("ДЗ (принято)")

    def get_field_name_plan_value(self, lesson: Lesson) -> str:
        return lesson.name if lesson.name else "Отсутствует"

    def get_field_name_fact_value(self, lesson: Lesson) -> str:
        return lesson.name_fact if lesson.name_fact else "Отсутствует"

    def get_field_date_value(self, lesson: Lesson) -> str:
        return lesson.date.strftime('%d.%m.%Y') if lesson.date \
            else "Отсутствует"

    def get_field_time_value(self, lesson: Lesson) -> str:
        return (f"{lesson.start_time.strftime('%H:%M')} - "
                f"{lesson.end_time.strftime('%H:%M')}") if \
            (lesson.start_time and lesson.end_time) \
            else "Отсутствует"

    def get_field_teacher_value(self, lesson: Lesson) -> str:
        teacher = lesson.get_teacher()
        return f"{teacher.first_name} {teacher.last_name}" if teacher else ""

    def get_field_listeners_value(self, lesson: Lesson) -> str:
        listeners = [f'{listener.first_name} {listener.last_name}'
                     for listener in lesson.get_listeners()]
        return ", ".join(listeners) if listeners \
            else "Отсутствует"

    def get_field_methodist_value(self, learning_plan: LearningPlan) -> str:
        return (f'{learning_plan.metodist.first_name} '
                f'{learning_plan.metodist.last_name}') if (
            learning_plan.metodist) else "Отсутствует"

    def get_field_curators_value(self, learning_plan: LearningPlan) -> str:
        curators = [f'{curator.first_name} {curator.last_name}'
                    for curator in learning_plan.curators.all()]
        return ", ".join(curators) if curators else "Отсутствуют"

    def get_field_status_value(self, lesson: Lesson) -> str:
        if lesson.status == 0:
            return "Не проведён"
        if lesson.status == 1:
            return "Проведён"
        if lesson.status == 2:
            return "Отменён"

    def get_field_review_materials_value(self, lesson: Lesson) -> str:
        if (lesson.lesson_teacher_review is None or
                lesson.lesson_teacher_review.materials is None):
            return "Отсутствует"
        return lesson.lesson_teacher_review.materials

    def get_field_review_lexis_value(self, lesson: Lesson) -> str:
        if (lesson.lesson_teacher_review is None or
                lesson.lesson_teacher_review.lexis is None):
            return "Отсутствует"
        return lesson.lesson_teacher_review.lexis

    def get_field_review_grammar_value(self, lesson: Lesson) -> str:
        if (lesson.lesson_teacher_review is None or
                lesson.lesson_teacher_review.grammar is None):
            return "Отсутствует"
        return lesson.lesson_teacher_review.grammar

    def get_field_review_note_value(self, lesson: Lesson) -> str:
        if (lesson.lesson_teacher_review is None or
                lesson.lesson_teacher_review.note is None):
            return "Отсутствует"
        return lesson.lesson_teacher_review.note

    def get_field_review_org_value(self, lesson: Lesson) -> str:
        if (lesson.lesson_teacher_review is None or
                lesson.lesson_teacher_review.org is None):
            return "Отсутствует"
        return lesson.lesson_teacher_review.org

    def get_field_review_dt_value(self, lesson: Lesson) -> str:
        if (lesson.lesson_teacher_review is None or
                lesson.lesson_teacher_review.dt is None):
            return "Отсутствует"
        return (f"Дата и время заполнения: "
                f"{lesson.lesson_teacher_review.dt.strftime('%d.%m.%Y %H:%M')}")

    def get_field_admin_comment_value(self, lesson: Lesson) -> str:
        if lesson.admin_comment is None:
            return "Отсутствует"
        return lesson.admin_comment

    def get_field_hw_all_value(self, hw_info: list) -> str:
        return str(len(hw_info))

    def get_field_hw_agreement_value(self, hw_info: list) -> str:
        return str(len(list(filter(
            lambda info: info.agreement.get("accepted") is False, hw_info
        ))))

    def get_field_hw_processing_value(self, hw_info: list) -> str:
        return str(len(list(filter(
            lambda info: info.status in [1, 2, 5, 7], hw_info
        ))))

    def get_field_hw_checking_value(self, hw_info: list) -> str:
        return str(len(list(filter(
            lambda info: info.status == 3, hw_info
        ))))

    def get_field_hw_accepted_value(self, hw_info: list) -> str:
        return str(len(list(filter(
            lambda info: info.status == 4, hw_info
        ))))

    def filter_hw(self, lesson: Lesson, hw_statuses, hw_agreement):
        homework_statuses = [hw.get_status() for hw in lesson.homeworks.all()]
        for hw_status in homework_statuses:
            if hw_agreement and hw_status.agreement.get("accepted") is False:
                return True
            if (hw_statuses and hw_status.status in
                    [int(st) for st in hw_statuses]):
                return True
        return False

    def get_queryset(self):
        query = dict()
        lesson_status = self.filter_query.get("filter_status")
        ds = self.filter_query.get("filter_date_start")
        de = self.filter_query.get("filter_date_end")
        teachers = self.filter_query.get("filter_list_teachers")
        listeners = self.filter_query.get("filter_list_listeners")
        has_hw = self.filter_query.get("filter_hw")
        name = self.filter_query.get("filter_name")
        has_comment = self.filter_query.get("filter_admin_comment")
        hw_agreement = self.filter_query.get("filter_hw_agreement_status")
        hw_statuses = self.filter_query.get("filter_list_hw_statuses")
        lesson_places = self.filter_query.get("filter_list_places")
        if lesson_status:
            query['status'] = lesson_status
        if ds:
            query['date__gte'] = ds
        if de:
            query['date__lte'] = de
        if listeners:
            query['learningphases__learningplan__listeners__in'] = listeners
        if has_hw == "false":
            query['hw_count'] = 0
        elif has_hw == "true":
            query['hw_count__gt'] = 0
        if name:
            query['name__icontains'] = name
        if lesson_places:
            query['place__in'] = lesson_places
        if has_comment == "false":
            query['admin_comment__isnull'] = True
        elif has_comment == "true":
            query['admin_comment__isnull'] = False
        if teachers:
            queryset = Lesson.objects.annotate(
                hw_count=Count("homeworks")
            ).filter(
                Q(learningphases__learningplan__teacher_id__in=teachers,
                  **query) |
                Q(replace_teacher_id__in=teachers,
                  **query)
            )
        else:
            queryset = Lesson.objects.annotate(
                hw_count=Count("homeworks")
            ).filter(**query)
        if queryset and (hw_agreement or hw_statuses):
            listed_queryset = list(queryset)
            filtered_queryset = list(filter(
                lambda lesson: self.filter_hw(lesson,
                                              hw_statuses,
                                              hw_agreement),
                listed_queryset
            ))
            if not filtered_queryset:
                return None
            queryset = Lesson.objects.filter(
                id__in=[lesson.id for lesson in filtered_queryset]
            )
        self.queryset = queryset


@shared_task
def lessons_download(filter_query: dict,
                     fields: list,
                     note_id: int):
    data = LessonsDataCreator(filter_query, fields)
    file = ExcelFileMaker(
        data=data.data,
        columns=data.fields_ru,
        filename=f'Занятия_'
                 f'{datetime.date.today().strftime("%d.%m.%Y")}'
    )
    note = GenerateFilesTasks.objects.get(pk=note_id)
    note.task_complete = timezone.now()
    note.output_file = file.filepath_db
    note.save()
