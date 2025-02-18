from django.db import models
from profile_management.models import NewUser

TASKS_TYPES = (
    (1, 'Все планы обучения'),
)


class GenerateFilesTasks(models.Model):
    type = models.IntegerField(verbose_name='Тип задания',
                               choices=TASKS_TYPES,
                               null=False,
                               blank=False)
    initiator = models.ForeignKey(NewUser,
                                  verbose_name='Инициатор',
                                  on_delete=models.SET_NULL,
                                  null=True,
                                  blank=True)
    task_dt = models.DateTimeField(verbose_name='Дата и время задания',
                                   null=False,
                                   blank=False,
                                   auto_now_add=True)
    task_complete = models.DateTimeField(verbose_name='Дата и время выполнения',
                                         null=True,
                                         blank=True)
    output_file = models.FileField(verbose_name="Готовый файл",
                                   null=True,
                                   blank=True)

    class Meta:
        verbose_name = 'Задание на генерацию'
        verbose_name_plural = 'Задания на генерацию'
        ordering = ['-task_dt']

    def __str__(self):
        return f'{self.type} - {self.task_dt}'
