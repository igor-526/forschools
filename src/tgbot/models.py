from django.db import models

from profile_management.models import NewUser

EVENT_CHOICES = (
    (0, 'Другое'),
    (1, 'Расписание на завтра'),
    (2, 'Напоминание о занятии'),
    (3, 'Домашнее заданее: новое'),
    (4, 'Домашнее заданее: сдача/проверка'),
    (5, 'Материалы: ручная отправка'),
    (6, 'Материалы: автоматическая отправка'),
    (7, 'Новое сообщение'),
    (8, 'Согласование ДЗ'),
    (9, 'Изменение ОС'),
    (10, 'Сообщения администратору'),
    (11, 'Привязка/отвязка Telegram'),
    (12, 'Напоминание о непроведённом занятии'),
    (13, 'Напоминание о непроверенном ДЗ'),
    (14, 'Напоминание о неcогласованном ДЗ'),
)


class TgBotJournal(models.Model):
    class Meta:
        verbose_name = 'Запись Telegram'
        verbose_name_plural = 'Записи Telegram'
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
