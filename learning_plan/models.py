from django.db import models
from lesson.models import Lesson
from learning_program.models import LearningProgram


PLAN_STATUS_CHOICES = (
    (0, 'Обучение не начато'),
    (1, 'В процессе обучения'),
    (2, 'Обучение завершено'),
    (3, 'Обучение заморожено'),
)

PHASE_STATUS_CHOICES = (
    (0, "Этап не пройден"),
    (1, "Этап пройден"),
)


class LearningPhases(models.Model):
    name = models.CharField(verbose_name="Наименование",
                            null=False,
                            blank=False,
                            max_length=200)
    purpose = models.CharField(verbose_name="Цель",
                               blank=True,
                               null=True,
                               max_length=1000)
    lessons = models.ManyToManyField(Lesson,
                                     verbose_name="Занятия",
                                     blank=True)
    status = models.IntegerField(verbose_name="Статус",
                                 choices=PLAN_STATUS_CHOICES,
                                 default=0,
                                 blank=True,
                                 null=False)

    class Meta:
        verbose_name = 'Этап плана обучения'
        verbose_name_plural = 'Этапы плана обучения'
        ordering = ['pk']

    def __str__(self):
        return self.name


class LearningPlan(models.Model):
    name = models.CharField(verbose_name="Наименование",
                            null=False,
                            blank=False)
    from_program = models.ForeignKey(LearningProgram,
                                     verbose_name="Из програмы:",
                                     null=True,
                                     blank=True,
                                     on_delete=models.SET_NULL)
    schedule = models.JSONField(verbose_name="Расписание",
                                null=True,
                                blank=True)
    listeners = models.ManyToManyField("profile_management.NewUser",
                                       verbose_name="Ученики",
                                       related_name="plan_listeners",
                                       blank=False)
    teacher = models.ForeignKey("profile_management.NewUser",
                                verbose_name="Преподаватель",
                                blank=False,
                                null=True,
                                related_name="plan_teacher",
                                on_delete=models.SET_NULL)
    metodist = models.ForeignKey("profile_management.NewUser",
                                 verbose_name="Методист",
                                 blank=False,
                                 null=True,
                                 related_name="plan_metodist",
                                 on_delete=models.SET_NULL)
    curators = models.ManyToManyField("profile_management.NewUser",
                                      verbose_name="Кураторы",
                                      related_name="plan_curator")
    purpose = models.CharField(verbose_name="Цель",
                               blank=True,
                               null=True)
    show_lessons = models.IntegerField(verbose_name="Видимость занятий",
                                       blank=True,
                                       null=True,
                                       default=7)
    show_materials = models.IntegerField(verbose_name="Видимость материалов",
                                         blank=True,
                                         null=True)
    default_hw_teacher = models.ForeignKey("profile_management.NewUser",
                                           blank=True,
                                           null=True,
                                           on_delete=models.SET_NULL,
                                           related_name="hw_teacher")
    phases = models.ManyToManyField(LearningPhases,
                                    verbose_name="Этапы обучения",
                                    blank=True)
    deadline = models.DateField(verbose_name="Срок",
                                blank=True,
                                null=True)
    status = models.IntegerField(verbose_name="Статус",
                                 null=False,
                                 blank=True,
                                 default=0,
                                 choices=PLAN_STATUS_CHOICES)
    pre_hw_comment = models.CharField(verbose_name="Комментарий перед ДЗ",
                                      null=True,
                                      blank=True,
                                      max_length=1000)
    can_report_lesson_name_only = models.BooleanField(
        verbose_name="Заполнять только наименование занятия",
        null=False,
        blank=False,
        default=False
    )

    class Meta:
        verbose_name = 'План обучения'
        verbose_name_plural = 'Планы обучения'
        ordering = ['pk']

    def get_next_lesson(self, lesson: Lesson):
        if not lesson.date:
            return None
        phases = [phase.id for phase in self.phases.all()]
        lesson = Lesson.objects.filter(learningphases__in=phases,
                                       date__gt=lesson.date).first()
        if not lesson:
            return None
        return lesson

    def get_is_closed(self):
        return (not Lesson.objects.filter(learningphases__learningplan=self,
                                          status=0).exists() and
                Lesson.objects.filter(
                    learningphases__learningplan=self
                ).exists())
