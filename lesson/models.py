from django.db import models
from django.utils import timezone
from profile_management.models import NewUser
from material.models import Material


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
    start = models.TimeField(verbose_name='Начало урока',
                             null=False,
                             blank=False)
    end = models.TimeField(verbose_name='Окончание урока',
                           null=False,
                           blank=False)
    date = models.DateField(verbose_name='Дата урока',
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
    completed = models.BooleanField(verbose_name='Урок проведён',
                                    default=False,
                                    null=False,
                                    blank=True)

    class Meta:
        verbose_name = 'Урок'
        verbose_name_plural = 'Уроки'
        ordering = ['start']

    def __str__(self):
        return f'{self.teacher} - {self.listener} - {self.start}'
