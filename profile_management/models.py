from django.db import models
from django.contrib.auth.models import AbstractUser, Group
from datetime import datetime
from random import randint


class Programs(models.Model):
    name = models.CharField(verbose_name='Наименование',
                            null=False,
                            blank=False)

    class Meta:
        verbose_name = 'Программа работы',
        verbose_name_plural = 'Программы работы',
        ordering = ['name']

    def __str__(self):
        return self.name


class Level(models.Model):
    name = models.CharField(verbose_name='Наименование',
                            null=False,
                            blank=False)

    class Meta:
        verbose_name = 'Уровень',
        verbose_name_plural = 'Уровни',
        ordering = ['name']

    def __str__(self):
        return self.name


class ListenerCategory(models.Model):
    name = models.CharField(verbose_name='Наименование',
                            null=False,
                            blank=False)

    class Meta:
        verbose_name = 'Категория учеников',
        verbose_name_plural = 'Категории учеников',
        ordering = ['name']

    def __str__(self):
        return self.name


class EngagementChannel(models.Model):
    name = models.CharField(verbose_name='Наименование',
                            null=False,
                            blank=False)

    class Meta:
        verbose_name = 'Канал привлечения',
        verbose_name_plural = 'Каналы привлечения',
        ordering = ['name']

    def __str__(self):
        return self.name


class NewUser(AbstractUser):
    photo = models.ImageField(verbose_name='Фотография профиля',
                              upload_to='profile_pictures/')
    last_activity = models.DateTimeField(verbose_name='Последняя активность',
                                         null=False,
                                         auto_now_add=True)
    tg_code = models.IntegerField(verbose_name='Код для присоединения Telegram',
                                  null=True,
                                  blank=True)
    bdate = models.DateField(verbose_name='День рождения',
                             null=True,
                             blank=True)
    work_experience = models.CharField(verbose_name='Опыт работы',
                                       null=True,
                                       blank=True)
    programs = models.ManyToManyField(Programs,
                                      verbose_name='Программы работы',
                                      blank=True)
    listener_category = models.ManyToManyField(ListenerCategory,
                                               verbose_name='Категории учеников',
                                               blank=True)
    private_lessons = models.BooleanField(verbose_name='Индивидуальные занятия',
                                          null=True,
                                          blank=True)
    group_lessons = models.BooleanField(verbose_name='Групповые занятия',
                                        null=True,
                                        blank=True)
    note = models.TextField(verbose_name='Примечание',
                            null=True,
                            blank=True)
    level = models.ManyToManyField(Level,
                                   verbose_name='Уровень',
                                   blank=True)
    progress = models.CharField(verbose_name='Прогресс',
                                null=True,
                                blank=True)
    engagement_channel = models.ForeignKey(EngagementChannel,
                                           verbose_name='Канал привлечения',
                                           blank=True,
                                           null=True,
                                           on_delete=models.DO_NOTHING)

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

    def set_group(self, group: str):
        group_obj = Group.objects.filter(name=group).first()
        self.groups.set([group_obj])



class Telegram(models.Model):
    user = models.ForeignKey(NewUser,
                             verbose_name='Пользователь',
                             on_delete=models.CASCADE,
                             related_name='telegram',
                             related_query_name='telegram_set',
                             null=False,
                             blank=False)
    tg_id = models.BigIntegerField(verbose_name='id',
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

    async def get_user(self):
        return self.user


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
