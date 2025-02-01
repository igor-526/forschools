from django.db import models
from django.db.models import Q

from profile_management.models import NewUser
from material.models import Material, File
from django.db.models.signals import post_save
from learning_program.models import LearningProgramHomework


HOMEWORK_STATUS_CHOISES = (
    (1, 'Создано'),
    (2, 'Открыто'),
    (3, 'На проверке'),
    (4, 'Принято'),
    (5, 'На доработке'),
    (6, 'Отменено'),
    (7, 'Задано'),
)


class Homework(models.Model):
    name = models.CharField(verbose_name='Наименование',
                            max_length=200,
                            null=False,
                            blank=False)
    teacher = models.ForeignKey(NewUser,
                                verbose_name='Преподаватель',
                                related_name='homeworks',
                                on_delete=models.CASCADE,
                                null=False,
                                blank=False)
    listener = models.ForeignKey(NewUser,
                                 verbose_name='Ученик',
                                 on_delete=models.CASCADE,
                                 null=False,
                                 blank=False)
    for_curator = models.BooleanField(verbose_name="Куратор работает с ДЗ",
                                      null=False,
                                      blank=True,
                                      default=True)
    materials = models.ManyToManyField(Material,
                                       verbose_name='Материалы',
                                       related_name='homework',
                                       related_query_name='homework_set',
                                       blank=True)
    description = models.TextField(verbose_name='Описание',
                                   null=True,
                                   blank=True,
                                   max_length=2000)
    deadline = models.DateField(verbose_name='Срок',
                                null=True,
                                blank=True)
    from_programs_hw = models.ForeignKey(LearningProgramHomework,
                                         verbose_name="Шаблон домашнего задания",
                                         null=True,
                                         blank=True,
                                         on_delete=models.SET_NULL)

    class Meta:
        verbose_name = 'Домашнее задание'
        verbose_name_plural = 'Домашние задания'
        ordering = ['-id']

    def __str__(self):
        return f'{self.name}'

    def get_tg_name(self, groups: list):
        lesson = self.get_lesson()
        name_str = self.name
        name_str += f" от {lesson.date.strftime('%d.%m')}"
        if "Teacher" in groups or "Metodist" in groups or "Curator" in groups or "Admin" in groups:
            name_str += f" ({self.listener})"
        return name_str

    async def aget_tg_name(self, groups: list):
        lesson = await self.aget_lesson()
        name_str = self.name
        name_str += f" от {lesson.date.strftime('%d.%m')}"
        if "Teacher" in groups or "Metodist" in groups or "Curator" in groups or "Admin" in groups:
            name_str += f" ({self.listener})"
        return name_str

    def get_status(self, assigned=False, accepted_only=False):
        filter_params = {
            'homework': self
        }
        if assigned:
            filter_params['status'] = 7
        if accepted_only:
            return HomeworkLog.objects.filter(Q(**filter_params, agreement__accepted=True) |
                                              Q(**filter_params, agreement={})).order_by("-dt").first()
        return HomeworkLog.objects.filter(**filter_params).order_by("-dt").first()

    async def aget_status(self, accepted_only=False):
        if accepted_only:
            return await (HomeworkLog.objects.filter(Q(homework=self, agreement__accepted=True) |
                                                     Q(homework=self, agreement={})).select_related("user")
                          .order_by("-dt").afirst())
        return await HomeworkLog.objects.filter(homework=self).select_related("user").order_by("-dt").afirst()

    def open(self):
        HomeworkLog.objects.create(homework=self,
                                   user=self.listener,
                                   status=2,
                                   comment="Домашнее задание открыто")

    async def aopen(self):
        await HomeworkLog.objects.acreate(homework=self,
                                          user=self.listener,
                                          status=2,
                                          comment="Домашнее задание открыто")

    def get_lesson(self):
        return self.lesson_set.first()

    async def aget_lesson(self):
        return await self.lesson_set.afirst()

    def set_assigned(self):
        if self.get_status().status != 6:
            lesson = self.get_lesson()
            lp = None
            if lesson:
                lp = lesson.get_learning_plan()
            if lp and lp.metodist:
                HomeworkLog.objects.create(homework=self,
                                           user=self.teacher,
                                           comment="Домашнее задание задано",
                                           status=7,
                                           agreement={
                                               "accepted_dt": None,
                                               "accepted": False
                                           })
                return {"agreement": True}
            else:
                HomeworkLog.objects.create(homework=self,
                                           user=self.teacher,
                                           comment="Домашнее задание задано",
                                           status=7)
                return {"agreement": False}

    async def aset_assigned(self, check_methodist=True):
        status = (await self.aget_status()).status
        if status != 6:
            if check_methodist:
                lesson = await self.aget_lesson()
                lp = None
                if lesson:
                    lp = await lesson.aget_learning_plan()
                if lp and lp.metodist:
                    await HomeworkLog.objects.acreate(homework=self,
                                                      user=self.teacher,
                                                      comment="Домашнее задание задано",
                                                      status=7,
                                                      agreement={
                                                          "accepted_dt": None,
                                                          "accepted": False
                                                      })

                    return {"agreement": True}
                else:
                    await HomeworkLog.objects.acreate(homework=self,
                                                      user=self.teacher,
                                                      comment="Домашнее задание задано",
                                                      status=7)
                    return {"agreement": False}
            else:
                await HomeworkLog.objects.acreate(homework=self,
                                                  user=self.teacher,
                                                  comment="Домашнее задание задано",
                                                  status=7)
                return {"agreement": False}


class HomeworkLog(models.Model):
    homework = models.ForeignKey(Homework,
                                 verbose_name='Домашнее задание',
                                 on_delete=models.CASCADE,
                                 null=False,
                                 blank=False,
                                 related_name='log',
                                 related_query_name='log_set')
    user = models.ForeignKey(NewUser,
                             verbose_name='Пользователь',
                             on_delete=models.CASCADE,
                             null=False,
                             blank=False,
                             related_name='hw_log',
                             related_query_name='hw_log_set')
    dt = models.DateTimeField(verbose_name='Дата и время',
                              auto_now_add=True,
                              null=False)
    files = models.ManyToManyField(File,
                                   verbose_name='Файлы',
                                   related_name='hw_log',
                                   related_query_name='hw_log_set',
                                   blank=True)
    comment = models.TextField(verbose_name='Комментарий',
                               null=True,
                               blank=True,
                               max_length=2000)
    status = models.IntegerField(verbose_name='Статус',
                                 choices=HOMEWORK_STATUS_CHOISES,
                                 default=1,
                                 null=False,
                                 blank=False)
    agreement = models.JSONField(verbose_name="Согласование",
                                 null=True,
                                 blank=True,
                                 default=dict)

    class Meta:
        verbose_name = 'Лог ДЗ'
        verbose_name_plural = 'Логи ДЗ',
        ordering = ['-dt']

    def __str__(self):
        return f'{self.user} - {self.status}'


class HomeworkGroups(models.Model):
    homeworks = models.ManyToManyField(Homework,
                                       verbose_name="Домашние заания")

    class Meta:
        verbose_name = 'Группа домашних заданий'
        verbose_name_plural = 'Группы домашних заданий'
        ordering = ['id']


def homework_new_log(sender, instance, created, **kwargs):
    if created:
        HomeworkLog.objects.create(homework=instance,
                                   user=instance.teacher,
                                   comment="Домашнее задание создано",
                                   status=1)


post_save.connect(homework_new_log, sender=Homework)