import datetime
from celery import shared_task
from django.db.models import QuerySet
from django.http import QueryDict
from download_data.models import GenerateFilesTasks
from download_data.utils import ExcelFileMaker
from homework.models import Homework, HomeworkLog
from learning_plan.models import LearningPlan
from lesson.models import Lesson
from django.utils import timezone


class PlansDownloader:
    ready_data: dict
    plan: LearningPlan
    lessons_queryset: QuerySet | None | list = None
    homeworks_queryset: QuerySet | None | list = None
    listeners_queryset: QuerySet | None | list = None

    def __init__(self, plan):
        self.ready_data = {}
        self.plan = plan

    def set_lessons_queryset(self):
        lessons = Lesson.objects.filter(
            learningphases__learningplan=self.plan
        )
        self.lessons_queryset = lessons if lessons is not None else []

    def set_homeworks_queryset(self):
        homeworks = Homework.objects.filter(
            lesson__learningphases__learningplan=self.plan
        )
        self.homeworks_queryset = homeworks if homeworks is not None else []

    def set_listeners_queryset(self):
        listeners = self.plan.listeners.all()
        self.listeners_queryset = listeners if listeners is not None else []

    def set_name(self):
        self.ready_data['Наименование'] = self.plan.name

    def set_teacher(self):
        self.ready_data['Преподаватель'] = (f'{self.plan.teacher.first_name} '
                                            f'{self.plan.teacher.last_name}')

    def set_hw_teacher(self):
        self.ready_data['Проверяющий ДЗ'] = \
            (f'{self.plan.default_hw_teacher.first_name} '
             f'{self.plan.default_hw_teacher.last_name}')

    def set_methodist(self):
        self.ready_data['Методист'] = \
            (f'{self.plan.metodist.first_name} '
             f'{self.plan.metodist.last_name}') if self.plan.metodist else (
                "Отсутсвует")

    def set_listeners(self):
        if not self.listeners_queryset:
            self.set_listeners_queryset()
        self.ready_data['Ученики'] = (
            ", ".join([f'{listener.first_name} '
                       f'{listener.last_name}' for
                       listener in self.listeners_queryset])) if (
                self.listeners_queryset is not None) else "Отсутсвуют"

    def set_curators(self):
        curators = self.plan.curators.all()
        self.ready_data['Кураторы'] = (
            ", ".join([f'{curator.first_name} {curator.last_name}'
                       for curator in curators])) if curators else (
            "Отсутсвуют")

    def set_schedule(self):
        if self.plan.schedule:
            self.ready_data['Расписание'] = "Отсутствует"
        else:
            self.ready_data['Расписание'] = "Отсутствует"

    def set_lessons_all(self):
        if not self.lessons_queryset:
            self.set_lessons_queryset()
        self.ready_data['Кол-во занятий (общее)'] = str(
            len(self.lessons_queryset) if self.lessons_queryset else "0"
        )

    def set_lessons_passed(self):
        if not self.lessons_queryset:
            self.set_lessons_queryset()
        self.ready_data['Кол-во занятий (Проведено)'] = str(
            len(self.lessons_queryset.filter(status=1)) if
            isinstance(self.lessons_queryset, QuerySet) else "0"
        )

    def set_lessons_canceled(self):
        if not self.lessons_queryset:
            self.set_lessons_queryset()
        self.ready_data['Кол-во занятий (Отменено)'] = str(
            len(self.lessons_queryset.filter(status=2))
            if isinstance(self.lessons_queryset, QuerySet) else "0")

    def set_hw_processing(self):
        if not self.homeworks_queryset:
            self.set_homeworks_queryset()
        if self.homeworks_queryset:
            self.ready_data['Кол-во ДЗ (Выполняются)'] = str(len(list(filter(
                lambda st: st in [2, 7],
                [hw.get_status() for hw in self.homeworks_queryset]
            ))))
        else:
            self.ready_data['Кол-во ДЗ (Выполняются)'] = "0"

    def set_hw_checking(self):
        if not self.homeworks_queryset:
            self.set_homeworks_queryset()
        if self.homeworks_queryset:
            self.ready_data['Кол-во ДЗ (Проверяются)'] = str(len(list(filter(
                lambda st: st == 3,
                [hw.get_status() for hw in self.homeworks_queryset]
            ))))
        else:
            self.ready_data['Кол-во ДЗ (Проверяются)'] = "0"

    def set_hw_agreement(self):
        if not self.homeworks_queryset:
            self.set_homeworks_queryset()
        if self.homeworks_queryset:
            self.ready_data['Кол-во ДЗ (На согласовании)'] = str(len(list(
                filter(lambda st: st.agreement.get("accepted") is False,
                       [hw.get_status() for hw in self.homeworks_queryset])
            )))
        else:
            self.ready_data['Кол-во ДЗ (На согласовании)'] = "0"

    def set_hw_processing_time(self):
        if not self.homeworks_queryset:
            self.set_homeworks_queryset()
        if isinstance(self.homeworks_queryset, QuerySet):
            all_times = []
            on_checking_logs = HomeworkLog.objects.filter(
                homework__lesson__learningphases__learningplan=self.plan,
                status=3
            )
            for hw_log in on_checking_logs:
                opened_log = HomeworkLog.objects.filter(
                    homework=hw_log.homework,
                    dt__lte=hw_log.dt,
                    status=2
                ).order_by("-dt").first()
                if opened_log:
                    t = hw_log.dt - opened_log.dt
                    all_times.append(t.seconds / 3600)
            if all_times:
                average = 0
                for t in all_times:
                    average += t
                average //= len(all_times)
                self.ready_data["ДЗ (Среднее время выполнения)"] = \
                    f'{average:.1f} часов'
            else:
                self.ready_data["ДЗ (Среднее время выполнения)"] = \
                    "Нет данных"

    def set_hw_checking_time(self):
        if not self.homeworks_queryset:
            self.set_homeworks_queryset()
        if isinstance(self.homeworks_queryset, QuerySet):
            all_times = []
            checked_logs = HomeworkLog.objects.filter(
                homework__lesson__learningphases__learningplan=self.plan,
                status__in=[4, 5]
            )
            for hw_log in checked_logs:
                opened_log = HomeworkLog.objects.filter(
                    homework=hw_log.homework,
                    dt__lte=hw_log.dt,
                    status=3
                ).order_by("-dt").first()
                if opened_log:
                    t = hw_log.dt - opened_log.dt
                    all_times.append(t.seconds / 3600)
            if all_times:
                average = 0
                for t in all_times:
                    average += t
                average //= len(all_times)
                self.ready_data["ДЗ (Среднее время проверки)"] = \
                    f'{average:.1f} часов'
            else:
                self.ready_data["ДЗ (Среднее время проверки)"] = \
                    "Нет данных"

    def set_hw_agreement_time(self):
        if not self.homeworks_queryset:
            self.set_homeworks_queryset()
        if isinstance(self.homeworks_queryset, QuerySet):
            all_times = []
            accepted_logs = HomeworkLog.objects.filter(
                homework__lesson__learningphases__learningplan=self.plan,
                agreement__accepted=True
            )
            for hw_log in accepted_logs:
                if hw_log.agreement.get("accepted_dt"):
                    accepted_dt = timezone.datetime(
                        year=hw_log.agreement.get("accepted_dt").get("year"),
                        month=hw_log.agreement.get("accepted_dt").get("month"),
                        day=hw_log.agreement.get("accepted_dt").get("day"),
                        hour=hw_log.agreement.get("accepted_dt").get("hour"),
                        minute=hw_log.agreement.get("accepted_dt").get("minute"),
                        second=0,
                        microsecond=0
                    )
                    t = accepted_dt - hw_log.dt.replace(tzinfo=None)
                    all_times.append(t.seconds / 3600)
            if all_times:
                average = 0
                for t in all_times:
                    average += t
                average /= len(all_times)
                self.ready_data["ДЗ (Среднее время согласования)"] = \
                    f'{average:.1f} часов'
            else:
                self.ready_data["ДЗ (Среднее время согласования)"] = \
                    "Нет данных"

    def get_age_by_bdate(self, bdate):
        if not bdate:
            return "Неизвестно"
        else:
            delta = datetime.date.today() - bdate
            age = int(delta.days // 365.25)
            return str(age)

    def set_listeners_age(self):
        if not self.listeners_queryset:
            self.set_listeners_queryset()
        self.ready_data["Возраст учеников"] = "\n".join(
            [f'{listener.first_name} {listener.last_name}: '
             f'{self.get_age_by_bdate(listener.bdate)}' if
             len(self.listeners_queryset) > 1 else
             self.get_age_by_bdate(listener.bdate)
             for listener in self.listeners_queryset]
        )

    def set_listeners_progress(self):
        if not self.listeners_queryset:
            self.set_listeners_queryset()
        progress_data = []
        for listener in self.listeners_queryset:
            if listener.progress:
                progress_data.append(
                    listener.progress if len(self.listeners_queryset) == 1
                    else f'{listener.first_name} {listener.last_name}: '
                         f'{listener.progress}'
                )
        self.ready_data["Прогресс учеников"] = "\n".join(progress_data)

    def set_listeners_note(self):
        if not self.listeners_queryset:
            self.set_listeners_queryset()
        notes_data = []
        for listener in self.listeners_queryset:
            if listener.note:
                notes_data.append(listener.note if len(
                    self.listeners_queryset) == 1 else
                                  f'{listener.first_name} '
                                  f'{listener.last_name}: {listener.note}'
                                  )
        self.ready_data["Примечания учеников"] = "\n".join(notes_data)

    def set_listeners_eng_channel(self):
        if not self.listeners_queryset:
            self.set_listeners_queryset()
        eng_channel_data = []
        for listener in self.listeners_queryset:
            if listener.engagement_channel:
                eng_channel_data.append(
                    listener.engagement_channel.name if
                    len(self.listeners_queryset) == 1
                    else  f'{listener.first_name} '
                          f'{listener.last_name}: '
                          f'{listener.engagement_channel.name}'
                )
        self.ready_data["Каналы привлечения учеников"] = (
            "\n".join(eng_channel_data)
        )

    def set_listeners_level(self):
        if not self.listeners_queryset:
            self.set_listeners_queryset()
        level_data = []
        for listener in self.listeners_queryset:
            if listener.level:
                level_data.append(listener.level.name if len(
                    self.listeners_queryset) == 1 else
                                  f'{listener.first_name} '
                                  f'{listener.last_name}: '
                                  f'{listener.level.name}')
        self.ready_data["Уровни учеников"] = "\n".join(level_data)


@shared_task
def plans_download(data: QueryDict, note_id: int):
    learning_plans = LearningPlan.objects.filter(
        id__in=data.getlist('plan_id')
    )
    all_data = []
    columns = []
    for learning_plan in learning_plans:
        plan_data = PlansDownloader(learning_plan)
        if data.get('name'):
            plan_data.set_name()
            if "Наименование" not in columns:
                columns.append("Наименование")
        if data.get('teacher'):
            plan_data.set_teacher()
            if "Преподаватель" not in columns:
                columns.append("Преподаватель")
        if data.get('hw_teacher'):
            plan_data.set_hw_teacher()
            if "Проверяющий ДЗ" not in columns:
                columns.append("Проверяющий ДЗ")
        if data.get('methodist'):
            plan_data.set_methodist()
            if "Методист" not in columns:
                columns.append("Методист")
        if data.get('listeners'):
            plan_data.set_listeners()
            if "Ученики" not in columns:
                columns.append("Ученики")
        if data.get('curators'):
            plan_data.set_curators()
            if "Кураторы" not in columns:
                columns.append("Кураторы")
        if data.get('schedule'):
            plan_data.set_schedule()
            if "Расписание" not in columns:
                columns.append("Расписание")
        if data.get('lessons_all'):
            plan_data.set_lessons_all()
            if "Кол-во занятий (общее)" not in columns:
                columns.append("Кол-во занятий (общее)")
        if data.get('lessons_passed'):
            plan_data.set_lessons_passed()
            if "Кол-во занятий (Проведено)" not in columns:
                columns.append("Кол-во занятий (Проведено)")
        if data.get('lessons_canceled'):
            plan_data.set_lessons_canceled()
            if "Кол-во занятий (Отменено)" not in columns:
                columns.append("Кол-во занятий (Отменено)")
        if data.get('hw_processing'):
            plan_data.set_hw_processing()
            if "Кол-во ДЗ (Выполняются)" not in columns:
                columns.append("Кол-во ДЗ (Выполняются)")
        if data.get('hw_checking'):
            plan_data.set_hw_checking()
            if "Кол-во ДЗ (Проверяются)" not in columns:
                columns.append("Кол-во ДЗ (Проверяются)")
        if data.get('hw_agreement'):
            plan_data.set_hw_agreement()
            if "Кол-во ДЗ (На согласовании)" not in columns:
                columns.append("Кол-во ДЗ (На согласовании)")
        if data.get('hw_processing_time'):
            plan_data.set_hw_processing_time()
            if "ДЗ (Среднее время выполнения)" not in columns:
                columns.append("ДЗ (Среднее время выполнения)")
        if data.get('hw_checking_time'):
            plan_data.set_hw_checking_time()
            if "ДЗ (Среднее время проверки)" not in columns:
                columns.append("ДЗ (Среднее время проверки)")
        if data.get('hw_agreement_time'):
            plan_data.set_hw_agreement_time()
            if "ДЗ (Среднее время согласования)" not in columns:
                columns.append("ДЗ (Среднее время согласования)")
        if data.get('listeners_age'):
            plan_data.set_listeners_age()
            if "Возраст учеников" not in columns:
                columns.append("Возраст учеников")
        if data.get('listeners_progress'):
            plan_data.set_listeners_progress()
            if "Прогресс учеников" not in columns:
                columns.append("Прогресс учеников")
        if data.get('listeners_note'):
            plan_data.set_listeners_note()
            if "Примечания учеников" not in columns:
                columns.append("Примечания учеников")
        if data.get('listeners_eng_channel'):
            plan_data.set_listeners_eng_channel()
            if "Каналы привлечения учеников" not in columns:
                columns.append("Каналы привлечения учеников")
        if data.get('listeners_level'):
            plan_data.set_listeners_level()
            if "Уровни учеников" not in columns:
                columns.append("Уровни учеников")
        all_data.append(plan_data.ready_data)
    file = ExcelFileMaker(
        data=all_data,
        columns=columns,
        filename=f'Планы_обучения_'
                 f'{datetime.date.today().strftime("%d.%m.%Y")}'
    )
    note = GenerateFilesTasks.objects.get(pk=note_id)
    note.task_complete = timezone.now()
    note.output_file = file.filepath_db
    note.save()
