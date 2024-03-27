from django.db import models
from django.utils import timezone
from profile_management.models import NewUser
from material.models import Material
from homework.models import Homework


LESSON_STATUS_CHOICES = (
    (0, 'Не проведён'),
    (1, 'Проведён')
)


class Place(models.Model):
    name = models.CharField(verbose_name='Наименование',
                            max_length=200,
                            null=False,
                            blank=False,
                            unique=True)
    url = models.URLField(verbose_name='Ссылка',
                          null=False,
                          blank=False,
                          unique=True)


class Lesson(models.Model):
    name = models.CharField(verbose_name='Наименование',
                            max_length=200,
                            null=False,
                            blank=False)
    start_time = models.TimeField(verbose_name='Начало урока',
                                  null=False,
                                  blank=False)
    end_time = models.TimeField(verbose_name='Окончание урока',
                                null=False,
                                blank=False)
    date = models.DateField(verbose_name='Дата урока',
                            null=False,
                            blank=False,
                            default=timezone.now)
    description = models.TextField(verbose_name='Описание урока',
                                   null=True,
                                   blank=True)
    replace_teacher = models.ForeignKey(NewUser,
                                        verbose_name='Замещающий преподаватель',
                                        on_delete=models.SET_NULL,
                                        null=True,
                                        blank=True,
                                        related_name='lessons')
    materials = models.ManyToManyField(Material,
                                       verbose_name='Материалы',
                                       related_name='lesson',
                                       related_query_name='lesson_set',
                                       blank=True)
    homeworks = models.ManyToManyField(Homework,
                                       verbose_name='Домашние задания',
                                       blank=True)
    place = models.ForeignKey(Place,
                              verbose_name='Место урока',
                              null=True,
                              blank=True,
                              on_delete=models.DO_NOTHING)
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
    status = models.IntegerField(verbose_name='Статус',
                                 default=0,
                                 null=False,
                                 blank=True,
                                 choices=LESSON_STATUS_CHOICES)

    class Meta:
        verbose_name = 'Урок'
        verbose_name_plural = 'Уроки'
        ordering = ['date']

    def __str__(self):
        return f'{self.name} - {self.date}'
