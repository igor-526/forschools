from django.db import models
from django.utils import timezone

from chat.utils import chat_message_get_readtime
from material.models import File

MESSAGE_PROFILE_TYPE_CHOICES = (
    (0, 'Основной'),
    (1, 'Родительский'),
    (2, 'Администратор'),
)


class AdminMessage(models.Model):
    sender = models.ForeignKey("profile_management.NewUser",
                               on_delete=models.SET_NULL,
                               verbose_name="Отправитель",
                               related_name='admin_message_sender',
                               null=True,
                               blank=True)
    receiver = models.ForeignKey("profile_management.NewUser",
                                 on_delete=models.SET_NULL,
                                 verbose_name="Получатель",
                                 related_name='admin_message_receiver',
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
        verbose_name = 'Сообщение администратору'
        verbose_name_plural = 'Сообщения администратору'
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

    def set_read(self, user_id):
        self.read_data[user_id] = self.get_readtime()
        self.save()

    async def aset_read(self, user_id):
        self.read_data[user_id] = self.get_readtime()
        await self.asave()


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
    sender_type = models.IntegerField(verbose_name="Тип профиля отправителя",
                                      null=False,
                                      blank=False,
                                      default=0,
                                      choices=MESSAGE_PROFILE_TYPE_CHOICES)
    receiver_type = models.IntegerField(verbose_name="Тип профиля получателя",
                                        null=False,
                                        blank=False,
                                        default=0,
                                        choices=MESSAGE_PROFILE_TYPE_CHOICES)
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
    tags = models.JSONField(verbose_name="Тэги",
                            null=False,
                            default=list)

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'
        ordering = ['-date']

    def __str__(self):
        return self.message

    def set_read(self, user_id: int, usertype=0) -> None:
        self.read_data[f'{usertype}_{user_id}'] = chat_message_get_readtime()
        print(self.read_data)
        self.save()

    async def aset_read(self, user_id, usertype=0) -> None:
        self.read_data[f'{usertype}_{user_id}'] = chat_message_get_readtime()
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
