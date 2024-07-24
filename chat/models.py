from django.db import models
from django.utils import timezone

from profile_management.models import NewUser
from material.models import File


class Message(models.Model):
    sender = models.ForeignKey(NewUser,
                               on_delete=models.DO_NOTHING,
                               verbose_name="Отправитель",
                               related_name='message_sender')
    receiver = models.ForeignKey(NewUser,
                                 on_delete=models.DO_NOTHING,
                                 verbose_name="Получатель",
                                 related_name='message_receiver')
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
