from django.db import models
from django.utils import timezone
from material.models import File


class Message(models.Model):
    sender = models.ForeignKey("profile_management.NewUser",
                               on_delete=models.DO_NOTHING,
                               verbose_name="Отправитель",
                               related_name='message_sender',
                               null=True,
                               blank=True)
    receiver = models.ForeignKey("profile_management.NewUser",
                                 on_delete=models.DO_NOTHING,
                                 verbose_name="Получатель",
                                 related_name='message_receiver',
                                 null=True,
                                 blank=True)
    sender_tg = models.ForeignKey("profile_management.Telegram",
                                  on_delete=models.DO_NOTHING,
                                  verbose_name="Отправитель TG",
                                  related_name='message_tg_sender',
                                  null=True,
                                  blank=True)
    receiver_tg = models.ForeignKey("profile_management.Telegram",
                                    on_delete=models.DO_NOTHING,
                                    verbose_name="Получатель TG",
                                    related_name='message_tg_receiver',
                                    null=True,
                                    blank=True)
    message = models.TextField(null=True,
                               blank=True,
                               max_length=2000,
                               verbose_name="Сообщение")
    date = models.DateTimeField(auto_now_add=True,
                                verbose_name="Дата отправки",
                                null=False,
                                blank=False)
    files = models.ManyToManyField(File,
                                   verbose_name="Вложения")
    read = models.DateTimeField(verbose_name="Дата прочтения",
                                null=True,
                                blank=True)

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'
        ordering = ['-read', '-date']

    def __str__(self):
        return self.message

    def set_read(self):
        self.read = timezone.now()
        self.save()

    async def aset_read(self):
        self.read = timezone.now()
        await self.asave()
