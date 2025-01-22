from django.db import models
from django.utils import timezone
from material.models import File


class Message(models.Model):
    sender = models.ForeignKey("profile_management.NewUser",
                               on_delete=models.SET_NULL,
                               verbose_name="Отправитель",
                               related_name='message_sender',
                               null=True,
                               blank=True)
    receiver = models.ForeignKey("profile_management.NewUser",
                                 on_delete=models.SET_NULL,
                                 verbose_name="Получатель",
                                 related_name='message_receiver',
                                 null=True,
                                 blank=True)
    sender_tg = models.ForeignKey("profile_management.Telegram",
                                  on_delete=models.SET_NULL,
                                  verbose_name="Отправитель TG",
                                  related_name='message_tg_sender',
                                  null=True,
                                  blank=True)
    receiver_tg = models.ForeignKey("profile_management.Telegram",
                                    on_delete=models.SET_NULL,
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
    read_data = models.JSONField(verbose_name="Прочитано",
                                 null=False,
                                 default=dict)

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'
        ordering = ['-date']

    def __str__(self):
        return self.message

    def get_readtime(self):
        readtime = timezone.now()
        readtime = {
            "year": readtime.year,
            "month": readtime.month,
            "day": readtime.day,
            "hour": readtime.hour,
            "minute": readtime.minute,
            "second": readtime.second,
        }
        return readtime

    def set_read(self, user_id, usertype):
        if usertype == 'NewUser':
            self.read_data[f'nu{user_id}'] = self.get_readtime()
        elif usertype == 'Telegram':
            self.read_data[f'tg{user_id}'] = self.get_readtime()
        self.save()

    async def aset_read(self, user_id, usertype):
        if usertype == 'NewUser':
            self.read_data[f'nu{user_id}'] = self.get_readtime()
        elif usertype == 'Telegram':
            self.read_data[f'tg{user_id}'] = self.get_readtime()
        await self.asave()


class GroupChats(models.Model):
    name = models.CharField(max_length=52,
                            verbose_name="Наименование",
                            null=False,
                            blank=False,
                            unique=True)
    photo = models.ImageField(verbose_name='Фотография чата',
                              upload_to='profile_pictures/',
                              null=False,
                              blank=True,
                              default='profile_pictures/base_chat_avatar.png')
    users = models.ManyToManyField("profile_management.NewUser",
                                   related_name="group_chats",
                                   verbose_name="Пользователи")
    users_tg = models.ManyToManyField("profile_management.Telegram",
                                      related_name="group_chats",
                                      verbose_name="Пользователи TG")
    administrators = models.ManyToManyField("profile_management.NewUser",
                                            related_name="group_chats_admin",
                                            verbose_name="Пользователи")
    owner = models.ForeignKey("profile_management.NewUser",
                              on_delete=models.DO_NOTHING,
                              verbose_name="Владелец",
                              related_name='group_chats_owner',
                              null=True,
                              blank=True
                              )
    messages = models.ManyToManyField(Message,
                                      related_name="group_chats_messages",
                                      verbose_name="Сообщения")
