from django.db import models
from profile_management.models import NewUser
from material.models import File

EVENT_CHOICES = (
    (0, 'Другое'),
    (1, 'Расписание на завтра'),    # работает, но не совсем корректно
    (2, 'Напоминание о занятии'),   # работает
    (3, 'Домашнее заданее: новое'),
    (4, 'Домашнее заданее: сдача/проверка'),
    (5, 'Материалы: ручная отправка'),
    (6, 'Материалы: автоматическая отправка'),
    (7, 'Новое сообщение'),     # работает
)


class TgBotJournal(models.Model):
    class Meta:
        verbose_name = 'Домашнее задание'
        verbose_name_plural = 'Домишние задания'
        ordering = ['-dt']

    initiator = models.ForeignKey(NewUser,
                                  verbose_name="Инициатор",
                                  on_delete=models.DO_NOTHING,
                                  null=True,
                                  blank=True,
                                  related_name="tgjournal_initiator")
    recipient = models.ForeignKey(NewUser,
                                  verbose_name="Получатель",
                                  on_delete=models.DO_NOTHING,
                                  null=True,
                                  blank=True,
                                  related_name="tgjournal_recipient")
    event = models.IntegerField(verbose_name="Событие",
                                default=0,
                                choices=EVENT_CHOICES,
                                null=False,
                                blank=False)
    data = models.JSONField(verbose_name="Информация",
                            null=False,
                            blank=False,
                            default=dict)
    dt = models.DateTimeField(auto_now_add=True,
                              null=False,
                              blank=False,
                              verbose_name="Дата и время")
