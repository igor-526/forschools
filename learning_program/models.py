from django.db import models
from profile_management.models import NewUser
from material.models import Material


class LearningProgramHomework(models.Model):
    name = models.CharField(verbose_name='Наименование',
                            max_length=200,
                            null=False,
                            blank=False)
    materials = models.ManyToManyField(Material,
                                       verbose_name='Материалы',
                                       related_name='learning_program_homework',
                                       blank=True)
    description = models.TextField(verbose_name='Описание',
                                   null=True,
                                   blank=True,
                                   max_length=2000)
    owner = models.ForeignKey(NewUser,
                              verbose_name="Владелец",
                              blank=True,
                              null=True,
                              on_delete=models.SET_NULL)
    visibility = models.BooleanField(verbose_name="Видимость ДЗ",
                                     null=False,
                                     default=True,
                                     blank=True)
    materials_comment = models.JSONField(verbose_name="Описание материала",
                                         null=True,
                                         blank=True,
                                         default=dict)


class LearningProgramLesson(models.Model):
    name = models.CharField(verbose_name='Наименование',
                            max_length=200,
                            null=False,
                            blank=False)
    description = models.TextField(verbose_name='Описание урока',
                                   null=True,
                                   blank=True)
    materials = models.ManyToManyField(Material,
                                       verbose_name='Материалы',
                                       related_name='learning_program_lesson',
                                       blank=True)
    homeworks = models.ManyToManyField(LearningProgramHomework,
                                       verbose_name='Домашние задания',
                                       blank=True)
    owner = models.ForeignKey(NewUser,
                              verbose_name="Владелец",
                              blank=True,
                              null=True,
                              on_delete=models.SET_NULL)
    visibility = models.BooleanField(verbose_name="Видимость урока",
                                     null=False,
                                     default=True,
                                     blank=True)

    class Meta:
        verbose_name = 'Урок'
        verbose_name_plural = 'Уроки'
        ordering = ['pk']

    def __str__(self):
        return f'{self.name}'


class LearningProgramPhase(models.Model):
    name = models.CharField(verbose_name="Наименование",
                            null=False,
                            blank=False)
    purpose = models.CharField(verbose_name="Цель",
                               blank=True,
                               null=True,)
    lessons = models.ManyToManyField(LearningProgramLesson,
                                     verbose_name="Уроки",
                                     blank=True)
    lessons_order = models.JSONField(verbose_name="Порядок уроков",
                                     null=False,
                                     blank=True,
                                     default=list)
    created_at = models.DateField(verbose_name="Дата создания",
                                  auto_now_add=True,
                                  null=True,
                                  blank=True)
    owner = models.ForeignKey(NewUser,
                              verbose_name="Владелец",
                              blank=True,
                              null=True,
                              on_delete=models.SET_NULL)
    visibility = models.BooleanField(verbose_name="Видимость этапа",
                                     null=False,
                                     default=True,
                                     blank=True)

    class Meta:
        verbose_name = 'Этап программы обучения'
        verbose_name_plural = 'Этапы программы обучения'
        ordering = ['pk']


class LearningProgram(models.Model):
    name = models.CharField(verbose_name="Наименование",
                            null=False,
                            blank=False)
    owner = models.ForeignKey(NewUser,
                              verbose_name="Владелец",
                              blank=True,
                              null=True,
                              on_delete=models.SET_NULL)
    purpose = models.CharField(verbose_name="Цель",
                               blank=True,
                               null=True)
    phases = models.ManyToManyField(LearningProgramPhase,
                                    verbose_name="Этапы программы обучения",
                                    blank=True)
    phases_order = models.JSONField(verbose_name="Порядок этапов",
                                    null=False,
                                    blank=True,
                                    default=list)
    created_at = models.DateField(verbose_name="Дата создания",
                                  auto_now_add=True,
                                  null=True,
                                  blank=True)
    visibility = models.BooleanField(verbose_name="Видимость программы",
                                     null=False,
                                     default=True,
                                     blank=True)

    class Meta:
        verbose_name = 'Программа обучения'
        verbose_name_plural = 'Программы обучения'
        ordering = ['pk']

    def get_all_info(self):
        phase_counter = 0
        lessons_counter = 0
        homeworks_counter = 0
        phases_ids = [p.id for p in self.phases.all()]
        phase_counter = len(phases_ids)
        lessons_ids = [l.id for l in LearningProgramLesson.objects.filter(learningprogramphase__in=phases_ids)]
        lessons_counter = len(lessons_ids)
        homeworks_ids = [hw.id for hw in LearningProgramHomework.objects.filter(learningprogramlesson__in=lessons_ids)]
        homeworks_counter = len(homeworks_ids)
        return {
            "phases": phase_counter,
            "lessons": lessons_counter,
            "homeworks": homeworks_counter
        }

    def get_lessons_count(self):
        return LearningProgramLesson.objects.filter(learningprogramphase__learningprogram=self).count()
