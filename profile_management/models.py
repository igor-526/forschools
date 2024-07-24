from django.db import models
from django.contrib.auth.models import AbstractUser, Group
from random import randint

from django.db.models import Q
from django.utils import timezone


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
                              upload_to='profile_pictures/',
                              null=False,
                              blank=True,
                              default='profile_pictures/base_avatar.png')
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
    level = models.ForeignKey(Level,
                              verbose_name='Уровень',
                              blank=True,
                              null=True,
                              on_delete=models.SET_NULL)
    progress = models.CharField(verbose_name='Прогресс',
                                null=True,
                                blank=True)
    engagement_channel = models.ForeignKey(EngagementChannel,
                                           verbose_name='Канал привлечения',
                                           blank=True,
                                           null=True,
                                           on_delete=models.SET_NULL)

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['-is_active', 'last_name', 'first_name']

    def __str__(self):
        return self.first_name + ' ' + self.last_name

    def update_tg_code(self):
        self.tg_code = randint(10000, 99999)
        self.save()
        return self.tg_code

    def update_last_activity(self):
        self.last_activity = timezone.localtime(timezone.now())
        self.save()

    def set_groups(self, groups: list):
        try:
            groupslist = [Group.objects.get(name=group) for group in groups]
            self.groups.set(groupslist)
            return "success"
        except Group.DoesNotExist:
            return "Произошла ошибка при определении роли"

    def set_engagement_channel(self, eng_ch, can_create=False):
        if eng_ch is None:
            self.engagement_channel = None
            self.save()
            return "success"
        else:
            eng_ch = eng_ch.strip(" ")
            if eng_ch != "":
                if can_create:
                    eng_channel = EngagementChannel.objects.get_or_create(name=eng_ch)
                    self.engagement_channel = eng_channel[0]
                else:
                    try:
                        eng_channel = EngagementChannel.objects.get(name=eng_ch)
                        self.engagement_channel = eng_channel
                    except EngagementChannel.DoesNotExist:
                        return "Канал привлечения не найден"
                self.save()
                return "success"
            else:
                return "Произошла ошибка при определении наименования"

    def set_level(self, level: str, can_create=False):
        if level is None:
            self.level = None
            self.save()
            return "success"
        else:
            level = level.strip(" ")
        if level != "":
            if can_create:
                level_obj = Level.objects.get_or_create(name=level)
                self.level = level_obj[0]
            else:
                try:
                    level_obj = Level.objects.get(name=level)
                    self.level = level_obj
                except Level.DoesNotExist:
                    return "Уровень не найден"
            self.save()
            return "success"
        else:
            return "Произошла ошибка при определении наименования"

    def set_programs(self, programslist: list, new=None):
        all_progs = []
        if "new" in programslist:
            programslist.remove("new")

        for prog in programslist:
            if not prog.strip(" ") == "":
                try:
                    all_progs.append(Programs.objects.get(name=prog))
                except Programs.DoesNotExist:
                    return "Программа обучения не найдена"
        if new and new.strip(" ") != "":
            all_progs.append(Programs.objects.get_or_create(name=new)[0])
        self.programs.set(all_progs)
        return "success"

    def set_lessons_type(self, private, group):
        self.private_lessons = True if private else False
        self.group_lessons = True if group else False
        self.save()

    def delete_photo(self):
        self.photo = 'profile_pictures/base_avatar.png'
        self.save()

    def get_users_for_chat(self):
        users = []
        if self.groups.filter(name__in=['Admin', 'Metodist']).exists():
            users = [{
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}",
                "unreaded": 0
            } for u in NewUser.objects.filter(is_active=True)]
        elif self.groups.filter(name="Teacher").exists():
            users = [{
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}",
                "unreaded": 0
            } for u in NewUser.objects.filter(
                Q(plan_listeners__teacher=self,
                  is_active=True) |
                Q(plan_listeners__phases__lessons__replace_teacher=self,
                  is_active=True)).distinct()]
        elif self.groups.filter(name='Listener').exists():
            users = [{
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}",
                "unreaded": 0
            } for u in NewUser.objects.filter(
                Q(plan_listeners__listeners=self,
                  is_active=True) |
                Q(replace_teacher__learningphases__learningplan__listeners=self,
                  is_active=True)).distinct()]
        return users

    async def aget_users_for_chat(self):
        admin_or_metodist = await self.groups.filter(name__in=['Admin', 'Metodist']).aexists()
        if admin_or_metodist:
            return [{
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}",
                "unreaded": 0
            } async for u in NewUser.objects.filter(is_active=True)]
        teacher = await self.groups.filter(name="Teacher").aexists()
        if teacher:
            print("teacher")
            return [{
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}",
                "unreaded": 0
            } async for u in NewUser.objects.filter(
                Q(plan_listeners__teacher=self,
                  is_active=True) |
                Q(groups__name__in=["Admin", "Metodist"]) |
                Q(plan_listeners__phases__lessons__replace_teacher=self,
                  is_active=True)).distinct()]
        listener = await self.groups.filter(name='Listener').aexists()
        if listener:
            return [{
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}",
                "unreaded": 0
            } async for u in NewUser.objects.filter(
                Q(plan_teacher__listeners=self,
                  is_active=True) |
                Q(groups__name="Admin",
                  is_active=True) |
                Q(replace_teacher__learningphases__learningplan__listeners=self,
                  is_active=True)).distinct()]


class Telegram(models.Model):
    user = models.ForeignKey(NewUser,
                             verbose_name='Пользователь',
                             on_delete=models.CASCADE,
                             related_name='telegram',
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
    notifications_changed_lesson = models.BooleanField(verbose_name="Уведомление об изменении занятия",
                                                       null=False,
                                                       blank=False,
                                                       default=True)
    notifications_lesson_day = models.BooleanField(verbose_name="Уведомление о занятии за сутки",
                                                   null=False,
                                                   blank=False,
                                                   default=True)
    notifications_lessons_hour = models.BooleanField(verbose_name="Уведомление о занятии за час",
                                                     null=False,
                                                     blank=False,
                                                     default=True)


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
