from _operator import itemgetter
from django.db import models
from django.contrib.auth.models import AbstractUser, Group
from random import randint
from django.db.models import Q
from django.utils import timezone
from chat.models import Message

PROFILE_EVENT_CHOICES = (
    (0, 'Привязка основного Telegram'),
    (1, 'Привязка родительского Telegram'),
    (2, 'Отвязка основного Telegram'),
    (3, 'Отвязка родительского Telegram'),
)

LESSON_REVIEW_FORM_MODE_CHOICES = (
    (0, 'Telegram WebApp'),
    (1, 'Telegram Chat'),
)


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
    patronymic = models.CharField(verbose_name="Отчество",
                                  null=True,
                                  blank=True,
                                  max_length=50)
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
                                       blank=True,
                                       max_length=1000)
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
                            blank=True,
                            max_length=1000)
    level = models.ForeignKey(Level,
                              verbose_name='Уровень',
                              blank=True,
                              null=True,
                              on_delete=models.SET_NULL)
    progress = models.CharField(verbose_name='Прогресс',
                                null=True,
                                blank=True,
                                max_length=1000)
    engagement_channel = models.ForeignKey(EngagementChannel,
                                           verbose_name='Канал привлечения',
                                           blank=True,
                                           null=True,
                                           on_delete=models.SET_NULL)
    setting_notifications_email = models.BooleanField(verbose_name="НАСТРОЙКА: Получать уведомления на email",
                                                      null=False,
                                                      default=True)
    tz = models.IntegerField(verbose_name="Часовой пояс",
                             null=False,
                             blank=False,
                             default=3)

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['-is_active', 'first_name', 'last_name']

    def __str__(self):
        return self.first_name + ' ' + self.last_name

    def update_tg_code(self):
        self.tg_code = randint(10000, 99999)
        self.save()
        return self.tg_code

    def update_last_activity(self):
        self.last_activity = timezone.localtime(timezone.now())
        self.save()

    async def aupdate_last_activity(self):
        self.last_activity = timezone.localtime(timezone.now())
        await self.asave()

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

    def set_lessons_type(self, private, group):
        self.private_lessons = True if private else False
        self.group_lessons = True if group else False
        self.save()

    def delete_photo(self):
        self.photo = 'profile_pictures/base_avatar.png'
        self.save()

    def get_info_deactivate(self):
        result = {
            "can_deactivate": True
        }
        group_chats = self.group_chats.all()
        if group_chats:
            result["can_deactivate"] = False
            result["group_chats"] = [{"id": item.id, "name": item.name} for item in group_chats]
        group_chats_admin = self.group_chats_admin.all()
        if group_chats_admin:
            result["can_deactivate"] = False
            result["group_chats_admin"] = [{"id": item.id, "name": item.name} for item in group_chats_admin]
        homework_teacher = self.homeworks.exclude(log_set__status__in=[4, 6, 7])
        if homework_teacher:
            result["can_deactivate"] = False
            result["homework_teacher"] = [{"id": item.id, "name": item.name} for item in homework_teacher]
        homework_listener = self.homework_set.exclude(log_set__status__in=[4, 6, 7])
        if homework_listener:
            result["can_deactivate"] = False
            result["homework_listener"] = [{"id": item.id, "name": item.name} for item in homework_listener]
        plan_curator = self.plan_curator.all()
        if plan_curator:
            result["can_deactivate"] = False
            result["plan_curator"] = [{"id": item.id, "name": item.name} for item in plan_curator]
        plan_listeners = self.plan_listeners.all()
        listed_plans = list(filter(lambda plan: plan.get_is_closed(), plan_listeners))
        if listed_plans:
            result["can_deactivate"] = False
            result["plan_listeners"] = [{"id": item.id, "name": item.name} for item in listed_plans]
        plan_methodist = self.plan_metodist.all()
        listed_plans = list(filter(lambda plan: plan.get_is_closed(), plan_methodist))
        if listed_plans:
            result["can_deactivate"] = False
            result["plan_methodist"] = [{"id": item.id, "name": item.name} for item in listed_plans]
        plan_teacher = self.plan_teacher.all()
        listed_plans = list(filter(lambda plan: plan.get_is_closed(), plan_teacher))
        if listed_plans:
            result["can_deactivate"] = False
            result["plan_teacher"] = [{"id": item.id, "name": item.name} for item in listed_plans]
        plan_hw_teacher = self.hw_teacher.all()
        listed_plans = list(filter(lambda plan: plan.get_is_closed(), plan_hw_teacher))
        if listed_plans:
            result["can_deactivate"] = False
            result["plan_hw_teacher"] = [{"id": item.id, "name": item.name} for item in listed_plans]
        lesson_replace_teacher = self.replace_teacher.filter(status=0)
        if lesson_replace_teacher:
            result["can_deactivate"] = False
            result["lesson_replace_teacher"] = [{"id": item.id, "name": item.name} for item in lesson_replace_teacher]
        return result

    def _remove_duplicates(self, lst):
        result = []
        for item in lst:
            if item not in result:
                result.append(item)
        return result

    def _sort_users_for_chat(self, users):
        filtered_users = users
        unread_list = list(filter(lambda u: u.get("unread"), filtered_users))
        has_messages_list = list(filter(lambda u: u.get("last_message_text") is not None and u not in unread_list, filtered_users))
        no_messages_list = list(filter(lambda u: u.get("last_message_text") is None, filtered_users))
        unread_list = sorted(unread_list, key=itemgetter("last_message_date"), reverse=True)
        has_messages_list = sorted(has_messages_list, key=itemgetter("last_message_date"), reverse=True)
        no_messages_list = sorted(no_messages_list, key=itemgetter("name"))
        return [*unread_list, *has_messages_list, *no_messages_list]

    def get_users_for_chat(self, from_user=False):
        def get_admin_support_user():
            info = {
                "id": None,
                "tg_id": None,
                "name": f"Администратор",
                "note": None,
                "chat_type": "Admin",
                "unread": 0,
                "photo": "/media/profile_pictures/base_avatar.png",
                "last_message_text": None,
                "last_message_date": None
            }
            last_message = Message.objects.filter(
                Q(sender=self) | Q(receiver=self)
            ).order_by('-date').first()
            if last_message:
                info["last_message_text"] = last_message.message[:50] if last_message.message else ""
                info["last_message_date"] = last_message.date
            return info

        def get_user_info(u):
            info = {
                "id": u.id,
                "tg_id": None,
                "name": f"{u.first_name} {u.last_name}",
                "note": None,
                "chat_type": "NewUser",
                "unread": self.get_unread_messages_count(u),
                "photo": u.photo.url,
                "last_message_text": None,
                "last_message_date": None
            }
            last_message = Message.objects.filter(
                Q(sender=u, receiver=self) | Q(receiver=u, sender=self)
            ).order_by('-date').first()
            if last_message:
                info["last_message_text"] = last_message.message[:50] if last_message.message else ""
                info["last_message_date"] = last_message.date
            return info

        def get_user_tg_info(u):
            info = {
                "id": None,
                "tg_id": u.id,
                "name": f"{u.user.first_name} {u.user.last_name}",
                "note": u.usertype,
                "chat_type": "Telegram",
                "unread": 0,
                "photo": u.user.photo.url,
                "last_message_text": None,
                "last_message_date": None
            }
            last_message = Message.objects.filter(
                Q(sender_tg=u, receiver=self) | Q(receiver_tg=u, sender=self)
            ).order_by('-date').first()
            if last_message:
                info["last_message_text"] = last_message.message[:50] if last_message.message else ""
                info["last_message_date"] = last_message.date
            return info

        def get_group_info(g):
            info = {
                "id": g.id,
                "name": g.name,
                "chat_type": "Group",
                "unread": 0,
                "photo": g.photo.url,
                "last_message_text": None,
                "last_message_date": None
            }
            return info

        groups = [get_group_info(g) for g in self.group_chats.all()]
        roles = [g.name for g in self.groups.all()]
        users_profiles = []
        if "Admin" in roles:
            users_profiles.extend([get_user_info(u) for u in NewUser.objects.filter(
                is_active=True).exclude(pk=self.id)])
        if "Metodist" in roles:
            users_profiles.extend([get_user_info(u) for u in NewUser.objects.filter(
                Q(plan_listeners__metodist=self,
                  is_active=True) |
                Q(plan_curator__metodist=self,
                  is_active=True) |
                Q(plan_teacher__metodist=self,
                  is_active=True)).exclude(pk=self.id).distinct()])
        if "Teacher" in roles:
            users_profiles.extend([get_user_info(u) for u in NewUser.objects.filter(
                Q(plan_listeners__teacher=self,
                  is_active=True) |
                Q(plan_curator__teacher=self,
                  is_active=True) |
                Q(plan_metodist__teacher=self,
                  is_active=True)).exclude(pk=self.id).distinct()])
        if "Curator" in roles:
            users_profiles.extend([get_user_info(u) for u in NewUser.objects.filter(
                Q(plan_listeners__curators=self,
                  is_active=True) |
                Q(plan_teacher__curators=self,
                  is_active=True) |
                Q(plan_metodist__curators=self,
                  is_active=True)).exclude(pk=self.id).distinct()])
        if "Listener" in roles:
            users_profiles.extend([get_user_info(u) for u in NewUser.objects.filter(
                Q(plan_teacher__listeners=self, is_active=True) |
                Q(plan_curator__listeners=self, is_active=True)).exclude(pk=self.id).distinct()])

        users_telegrams = [get_user_tg_info(u) for u in
                           Telegram.objects.select_related("user").filter(
                               user_id__in=[u.get("id") for u in users_profiles]).exclude(usertype="main")]
        users = [*users_profiles, *users_telegrams, *groups]
        users = self._remove_duplicates(users)
        users = self._sort_users_for_chat(users)
        if "Admin" not in roles and not from_user:
            users = [get_admin_support_user(), *users]
        return users

    async def aget_users_for_chat(self, tg_id):
        async def get_admin_support_user():
            info = {
                "id": 0,
                "name": f"Администратор",
                "note": None,
                "usertype": "Admin",
                "unreaded": 0,
                "last_message_date": None
            }
            last_message = await Message.objects.filter(
                Q(sender=self) | Q(receiver=self)
            ).order_by('-date').afirst()
            if last_message:
                info["last_message_date"] = last_message.date
            return info

        async def get_user_chat_info(u):
            info = {
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}",
                "chat_type": "NewUser",
                "unreaded": await aget_unread_messages_count(tgnote, {
                    "id": u.id,
                    "usertype": "NewUser"
                }),
                "usertype": "NewUser",
                "note": None,
                "last_message_date": None
            }
            last_message = await Message.objects.filter(
                Q(sender=u, receiver=self) | Q(receiver=u, sender=self)
            ).order_by('-date').afirst()
            if last_message:
                info["last_message_date"] = last_message.date
            return info

        async def get_user_tg_chat_info(u):
            info = {
                "id": u.id,
                "name": f"{u.user.first_name} {u.user.last_name}",
                "chat_type": "Telegram",
                "unreaded": await aget_unread_messages_count(tgnote, {
                    "id": u.user.id,
                    "usertype": "Telegram"
                }),
                "usertype": "Telegram",
                "note": u.usertype,
                "last_message_date": None
            }
            last_message = await Message.objects.filter(
                Q(sender_tg=u, receiver=self) | Q(receiver_tg=u, sender=self)
            ).order_by('-date').afirst()
            if last_message:
                info["last_message_date"] = last_message.date
            return info

        async def get_group_info(g):
            info = {
                "id": g.id,
                "name": g.name,
                "usertype": "Group",
                "unread": 0,
                "photo": g.photo.url,
                "last_message_text": None,
                "last_message_date": None
            }
            return info

        tgnote = await Telegram.objects.select_related("user").aget(tg_id=tg_id)
        if tgnote.usertype == "main":
            groups = [await get_group_info(g) async for g in tgnote.user.group_chats.all()]
        else:
            groups = [await get_group_info(g) async for g in tgnote.group_chats.all()]
        roles = [g.name async for g in self.groups.all()]
        users_profiles = []

        if "Admin" in roles:
            users_profiles.extend([await get_user_chat_info(u) async for u in NewUser.objects.filter(
                is_active=True).exclude(pk=self.id)])
        if "Metodist" in roles:
            users_profiles.extend([await get_user_chat_info(u) async for u in NewUser.objects.filter(
                Q(plan_listeners__metodist=self,
                  is_active=True) |
                Q(plan_curator__metodist=self,
                  is_active=True) |
                Q(plan_teacher__metodist=self,
                  is_active=True)).exclude(pk=self.id).distinct()])
        if "Teacher" in roles:
            users_profiles.extend([await get_user_chat_info(u) async for u in NewUser.objects.filter(
                Q(plan_listeners__teacher=self,
                  is_active=True) |
                Q(plan_curator__teacher=self,
                  is_active=True) |
                Q(plan_metodist__teacher=self,
                  is_active=True)).exclude(pk=self.id).distinct()])
        if "Curator" in roles:
            users_profiles.extend([await get_user_chat_info(u) async for u in NewUser.objects.filter(
                Q(plan_listeners__curators=self,
                  is_active=True) |
                Q(plan_teacher__curators=self,
                  is_active=True) |
                Q(plan_metodist__curators=self,
                  is_active=True)).exclude(pk=self.id).distinct()])
        if "Listener" in roles:
            users_profiles.extend([await get_user_chat_info(u) async for u in NewUser.objects.filter(
                Q(plan_teacher__listeners=self,
                  is_active=True) |
                Q(plan_curator__listeners=self,
                  is_active=True)).exclude(pk=self.id).distinct()])

        users_telegrams = [await get_user_tg_chat_info(u) async for u in
                           Telegram.objects.select_related("user").filter(
                               user_id__in=[u.get("id") for u in users_profiles]).exclude(usertype="main")]
        users = [*users_profiles, *users_telegrams, *groups]
        users = self._remove_duplicates(users)
        users = self._sort_users_for_chat(users)
        if "Admin" not in roles:
            users = [await get_admin_support_user(), *users]
        return users

    def get_unread_messages_count(self, sender=None):
        if sender is None:
            return self.message_receiver.exclude(read_data__key=f'nu{self.id}').count()
        else:
            return self.message_receiver.filter(sender=sender).exclude(read_data__key=f'nu{self.id}').count()

    def get_last_message_date(self):
        s_message = self.message_sender.order_by("-date").first()
        r_message = self.message_receiver.order_by("-date").first()
        if s_message and r_message:
            return s_message.date if s_message.date > r_message.date else r_message.date
        if s_message:
            return s_message.date
        if r_message:
            return r_message.date


class Telegram(models.Model):
    user = models.ForeignKey(NewUser,
                             verbose_name='Пользователь',
                             on_delete=models.CASCADE,
                             related_name='telegram',
                             null=False,
                             blank=False)
    allowed_users = models.ManyToManyField(NewUser,
                                           verbose_name="Пользователи",
                                           related_name='telegram_allowed')
    tg_id = models.BigIntegerField(verbose_name='id',
                                   null=False,
                                   blank=False,
                                   default=0,
                                   unique=True)
    nickname = models.CharField(verbose_name='ник',
                                null=True,
                                blank=True)
    first_name = models.CharField(verbose_name="Имя",
                                  null=True,
                                  blank=True)
    last_name = models.CharField(verbose_name="Фамилия",
                                 null=True,
                                 blank=True)
    setting_notifications_lesson_day = models.BooleanField(
        verbose_name="НАСТРОЙКА: Уведомление о занятии за сутки",
        null=False,
        blank=False,
        default=True
    )
    setting_notifications_lessons_hour = models.BooleanField(
        verbose_name="НАСТРОЙКА: Уведомление о занятии за час",
        null=False,
        blank=False,
        default=True
    )
    setting_notifications_tg_connecting = models.BooleanField(
        verbose_name="НАСТРОЙКА: Уведомление о привязке пользователя к TG",
        null=False,
        blank=False,
        default=True
    )
    last_message_from_user_time = models.DateTimeField(
        verbose_name="Время последнего взаимодействия с ботом",
        null=True,
        blank=True
    )
    last_message_from_user_id = models.IntegerField(
        verbose_name="ID последнего сообщения от пользователя",
        null=True,
        blank=True
    )
    setting_show_hw_materials = models.BooleanField(
        verbose_name="НАСТРОЙКА: Показывать материалы ДЗ",
        null=False,
        default=True
    )
    setting_lesson_review_form_mode = models.IntegerField(
        verbose_name="НАСТРОЙКА: Режим заполнения формы",
        null=False,
        blank=False,
        default=0,
        choices=LESSON_REVIEW_FORM_MODE_CHOICES
    )
    usertype = models.CharField(verbose_name="Тип пользователя",
                                null=False,
                                blank=False,
                                default='main',
                                max_length=20)
    join_dt = models.DateTimeField(verbose_name="Дата и время привязки",
                                   null=False,
                                   blank=False,
                                   default=timezone.now)

    class Meta:
        verbose_name = 'Привязанный Telegram'
        verbose_name_plural = 'Привязанные Telegram'
        ordering = ['join_dt']

    def __str__(self):
        return f'{str(self.user)} {self.nickname}'

    async def get_user(self):
        return self.user

    async def set_last_message(self, message_id: int):
        self.last_message_from_user_time = timezone.now()
        if not self.last_message_from_user_id:
            self.last_message_from_user_id = message_id
        else:
            if self.last_message_from_user_id < message_id:
                self.last_message_from_user_id = message_id
        await self.asave()


class ProfileEventsJournal(models.Model):
    class Meta:
        verbose_name = 'Событие пользователя'
        verbose_name_plural = 'События пользователя'
        ordering = ['-dt']

    event = models.IntegerField(verbose_name="Тип события",
                                choices=PROFILE_EVENT_CHOICES,
                                null=False,
                                blank=False)
    user = models.ForeignKey(to=NewUser,
                             verbose_name="Пользователь",
                             on_delete=models.CASCADE,
                             null=False,
                             blank=False,
                             related_name="events_user")
    initiator = models.ForeignKey(to=NewUser,
                                  verbose_name="Инициатор",
                                  on_delete=models.CASCADE,
                                  null=False,
                                  blank=False,
                                  related_name="events_initiator")
    dt = models.DateTimeField(auto_now_add=True,
                              null=False,
                              blank=False)

    def __str__(self):
        return f'({self.event}){str(self.user)}: {self.dt}'


async def aget_unread_messages_count(tgnote, sender=None, read=False):
    query = {"filter": {},
             "exclude": {},
             "read": {}}
    if sender:
        if sender.get("usertype") == "NewUser":
            query['filter']['sender_id'] = sender.get("id")
        elif sender.get("usertype") == "Telegram":
            query['filter']['sender_tg_id'] = sender.get("id")
    if tgnote.usertype == "main":
        query['exclude']['read_data__has_key'] = f'nu{tgnote.user.id}'
        query['read']['user_id'] = tgnote.user.id
        query['read']['usertype'] = 'NewUser'
        msgquery = [msg async for msg in
                    tgnote.user.message_receiver.filter(
                        **query['filter']
                    ).exclude(**query['exclude'])]
    else:
        query['exclude']['read_data__has_key'] = f'tg{tgnote.id}'
        query['read']['user_id'] = tgnote.id
        query['read']['usertype'] = 'Telegram'
        msgquery = [msg async for msg in
                    tgnote.message_tg_receiver.filter(
                        **query['filter']
                    ).exclude(**query['exclude'])]
    if read:
        for msg in msgquery:
            await msg.aset_read(**query['read'])
    return len(msgquery)
