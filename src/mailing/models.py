from django.db import models

from profile_management.models import NewUser

RESULT_CHOISES = (
    (0, 'В очереди'),
    (1, 'Выполнено частично'),
    (2, 'Выполнено полностью'),
)


class GroupMailingTasks(models.Model):
    name = models.CharField(verbose_name="Наименование рассылки",
                            max_length=200,
                            null=False,
                            blank=False)
    users = models.JSONField(verbose_name="Пользователи",
                             default=dict)
    messages = models.JSONField(verbose_name="Информация о сообщениях",
                                default=list)
    result_info = models.JSONField(verbose_name="Подробный резульатат",
                                   default=dict)
    initiator = models.ForeignKey(to=NewUser,
                                  verbose_name="Инициатор",
                                  on_delete=models.SET_NULL,
                                  null=True,
                                  blank=True)
    dt = models.DateTimeField(auto_now_add=True,
                              verbose_name="Дата и время рассылки",
                              null=False,
                              blank=False)
