from django.db import models
from learning_plan.models import LearningPlan
from profile_management.models import NewUser

LOG_TYPE_CHOICES = (
    (0, 'Другое'),
    (1, 'Работа методиста'),
    (2, 'Занятие'),
    (3, 'Учебный план'),
    (4, 'Домашнее задание')
)


class UserLog(models.Model):
    log_type = models.IntegerField(verbose_name="Тип события",
                                   null=False,
                                   blank=False,
                                   choices=LOG_TYPE_CHOICES,
                                   default=0)
    color = models.CharField(verbose_name="Цвет",
                             null=True,
                             blank=True)
    learning_plan = models.ForeignKey(LearningPlan,
                                      verbose_name="План обучения",
                                      null=True,
                                      blank=True,
                                      on_delete=models.SET_NULL)
    title = models.CharField(verbose_name="Заголовок",
                             null=False,
                             blank=False,)
    content = models.JSONField(verbose_name="Контент",
                               null=False,
                               blank=False,
                               default=dict)
    date = models.DateTimeField(verbose_name="Дата и время",
                                auto_now_add=True,
                                null=False,
                                blank=False)
    buttons = models.JSONField(verbose_name="Кнопки",
                               null=False,
                               blank=False,
                               default=list)
    files = models.JSONField(verbose_name="Файлы",
                             null=False,
                             blank=False,
                             default=list)
    user = models.ForeignKey(NewUser,
                             on_delete=models.SET_NULL,
                             null=True,
                             blank=True,
                             related_name='user_logs')
