from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import datetime
from random import randint


class NewUser(AbstractUser):
    photo = models.ImageField(verbose_name='Фотография профиля',
                              upload_to='profile_pictures/')
    last_activity = models.DateTimeField(verbose_name='Последняя активность',
                                         null=False,
                                         auto_now_add=True)
    tg_code = models.IntegerField(verbose_name='Код для присоединения Telegram',
                                  null=True,
                                  blank=True)

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return self.first_name + ' ' + self.last_name

    def update_tg_code(self):
        self.tg_code = randint(10000, 99999)
        super().save()
        return self.tg_code

    def update_last_activity(self):
        self.last_activity = datetime.now()


class Telegram(models.Model):
    user = models.ForeignKey(NewUser,
                             verbose_name='Пользователь',
                             on_delete=models.CASCADE,
                             related_name='telegram',
                             related_query_name='telegram_set',
                             null=False,
                             blank=False)
    tg_id = models.IntegerField(verbose_name='id',
                                null=False,
                                blank=False,
                                default=0,
                                unique=True)
    nickname = models.CharField(verbose_name='ник',
                                null=True,
                                blank=True)

    class Meta:
        verbose_name = 'Привязанный Telegram'
        verbose_name_plural = 'Привязанные Telegram'
        ordering = ['user']

    def __str__(self):
        return f'{str(self.user)} {self.nickname}'


class UserLog(models.Model):
    user = models.ForeignKey(NewUser,
                             verbose_name='Пользователь',
                             on_delete=models.CASCADE,
                             related_name='log',
                             related_query_name='log_set',
                             null=False,
                             blank=False)
    dt = models.DateTimeField(verbose_name='Дата и время',
                              auto_now_add=True,
                              null=False,
                              blank=False)
    comment = models.TextField(verbose_name='Комментарий',
                               null=False,
                               blank=False)

    class Meta:
        verbose_name = 'Лог',
        verbose_name_plural = 'Логи',
        ordering = ['dt']

    def __str__(self):
        return f'{self.user} - {self.comment} - {self.dt}'
