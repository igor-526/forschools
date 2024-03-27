from django.db import models
from profile_management.models import NewUser
from material.models import Material, File
from datetime import datetime, timedelta


HOMEWORK_STATUS_CHOISES = (
    (1, 'Создано'),
    (2, 'На проверке'),
    (3, 'Принято'),
    (4, 'На доработке'),
    (5, 'Отменено'),
)


class Homework(models.Model):
    name = models.CharField(verbose_name='Наименование',
                            max_length=200,
                            null=False,
                            blank=False)
    teacher = models.ForeignKey(NewUser,
                                verbose_name='Преподаватель',
                                related_name='homeworks',
                                on_delete=models.CASCADE,
                                null=False,
                                blank=False)
    listener = models.ForeignKey(NewUser,
                                 verbose_name='Ученик',
                                 on_delete=models.CASCADE,
                                 null=False,
                                 blank=False)
    materials = models.ManyToManyField(Material,
                                       verbose_name='Материалы',
                                       related_name='homework',
                                       related_query_name='homework_set',
                                       blank=True)
    description = models.TextField(verbose_name='Описание',
                                   null=True,
                                   blank=True,
                                   max_length=2000)
    deadline = models.DateField(verbose_name='Срок',
                                null=True,
                                blank=True,
                                default=datetime.now() + timedelta(days=1))

    class Meta:
        verbose_name = 'Домашнее задание'
        verbose_name_plural = 'Домишние задания'
        ordering = ['id']

    def __str__(self):
        return f'{self.name}'

    def get_status(self):
        return HomeworkLog.objects.filter(homework=self).first()


class HomeworkLog(models.Model):
    homework = models.ForeignKey(Homework,
                                 verbose_name='Домашнее задание',
                                 on_delete=models.CASCADE,
                                 null=False,
                                 blank=False,
                                 related_name='log',
                                 related_query_name='log_set')
    user = models.ForeignKey(NewUser,
                             verbose_name='Пользователь',
                             on_delete=models.CASCADE,
                             null=False,
                             blank=False,
                             related_name='hw_log',
                             related_query_name='hw_log_set')
    dt = models.DateTimeField(verbose_name='Дата и время',
                              auto_now_add=True,
                              null=False)
    files = models.ManyToManyField(File,
                                   verbose_name='Файлы',
                                   related_name='hw_log',
                                   related_query_name='hw_log_set',
                                   blank=True)
    comment = models.TextField(verbose_name='Комментарий',
                               null=True,
                               blank=True,
                               max_length=2000)
    status = models.IntegerField(verbose_name='Статус',
                                 choices=HOMEWORK_STATUS_CHOISES,
                                 default=1,
                                 null=False,
                                 blank=False)

    class Meta:
        verbose_name = 'Лог ДЗ'
        verbose_name_plural = 'Логи ДЗ',
        ordering = ['-dt']

    def __str__(self):
        return f'{self.user} - {self.status}'


