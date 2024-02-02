from django.db import models
from django.utils import timezone
from profile_management.models import NewUser
from material.models import Material
from homework.models import Homework


class Lesson(models.Model):
    name = models.CharField(verbose_name='Наименование',
                            max_length=200,
                            null=False,
                            blank=False)
    start = models.DateField(verbose_name='Начало урока',
                             null=False,
                             blank=False,
                             default=timezone.now)
    end = models.DateField(verbose_name='Окончание урока',
                           null=False,
                           blank=False,
                           default=timezone.now)
    teacher = models.ForeignKey(NewUser,
                                verbose_name='Преподаватель',
                                on_delete=models.CASCADE,
                                null=False,
                                blank=False,
                                related_name='lessons',)
    listener = models.ForeignKey(NewUser,
                                 verbose_name='Ученик',
                                 on_delete=models.CASCADE,
                                 null=False,
                                 blank=False,)
    materials = models.ManyToManyField(Material,
                                       verbose_name='Материалы',
                                       related_name='lesson',
                                       related_query_name='lesson_set',
                                       blank=True)
    homework = models.ForeignKey(Homework,
                                 verbose_name='Домашнее задание',
                                 on_delete=models.CASCADE,
                                 null=False,
                                 blank=False,
                                 related_name='lesson',
                                 related_query_name='lesson_set')
    zoom_url = models.URLField(verbose_name='Ссылка Zoom',
                               null=False,
                               blank=False,
                               default='https://')
    evaluation = models.IntegerField(verbose_name='Оценка урока',
                                     null=True,
                                     blank=True)
    note_teacher = models.CharField(verbose_name='Заметка преподавателя',
                                    max_length=2000,
                                    null=True,
                                    blank=True)
    note_listener = models.CharField(verbose_name='Заметка ученика',
                                     max_length=2000,
                                     null=True,
                                     blank=True)
    completed = models.BooleanField(verbose_name='Урок проведён',
                                    default=False,
                                    null=False,
                                    blank=False)

    class Meta:
        verbose_name = 'Урок'
        verbose_name_plural = 'Уроки'
        ordering = ['start']

    def __str__(self):
        return f'{self.teacher} - {self.listener} - {self.start}'
