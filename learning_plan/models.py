from django.db import models
from lesson.models import Lesson
from profile_management.models import NewUser
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
                            blank=False)
    purpose = models.CharField(verbose_name="Цель",
                               blank=True,
                               null=True)
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


class LearningPlan(models.Model):
    name = models.CharField(verbose_name="Наименование",
                            null=False,
                            blank=False)
    from_program = models.ForeignKey(LearningProgram,
                                     verbose_name="Из програмы:",
                                     null=True,
                                     blank=True,
                                     on_delete=models.SET_NULL)
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
    show_lessons = models.IntegerField(verbose_name="Видимость занятий",
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
    deadline = models.DateField(verbose_name="Срок",
                                blank=True,
                                null=True)
    status = models.IntegerField(verbose_name="Статус",
                                 null=False,
                                 blank=True,
                                 default=0,
                                 choices=PLAN_STATUS_CHOICES)

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
