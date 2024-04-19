from django.db import models
from lesson.models import Lesson
from profile_management.models import NewUser


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
                            blank=False)
    purpose = models.CharField(verbose_name="Цель",
                               blank=True,
                               null=True)
    lessons = models.ManyToManyField(Lesson,
                                     verbose_name="Уроки",
                                     blank=True)
    status = models.IntegerField(verbose_name="Статус",
                                 choices=PLAN_STATUS_CHOICES,
                                 default=0,
                                 blank=True,
                                 null=False)


class LearningPlan(models.Model):
    name = models.CharField(verbose_name="Наименование",
                            null=False,
                            blank=False)
    listeners = models.ManyToManyField(NewUser,
                                       verbose_name="Ученики",
                                       related_name="plan_listeners",
                                       blank=False)
    teacher = models.ForeignKey(NewUser,
                                verbose_name="Преподаватель",
                                blank=False,
                                null=True,
                                on_delete=models.SET_NULL)
    purpose = models.CharField(verbose_name="Цель",
                               blank=True,
                               null=True)
    show_lessons = models.IntegerField(verbose_name="Видимость уроков",
                                       blank=True,
                                       null=True,
                                       default=7)
    show_materials = models.IntegerField(verbose_name="Видимость материалов",
                                         blank=True,
                                         null=True)
    default_hw_teacher = models.ForeignKey(NewUser,
                                           blank=True,
                                           null=True,
                                           on_delete=models.SET_NULL,
                                           related_name="hw_teacher")
    phases = models.ManyToManyField(LearningPhases,
                                    verbose_name="Этапы обучения",
                                    blank=True)
    deadline = models.DateTimeField(verbose_name="Срок",
                                    blank=True,
                                    null=True)
    status = models.IntegerField(verbose_name="Статус",
                                 null=False,
                                 blank=True,
                                 default=0,
                                 choices=PLAN_STATUS_CHOICES)
