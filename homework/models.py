from django.db import models
from profile_management.models import NewUser
from material.models import Material, File
from django.db.models.signals import post_save


HOMEWORK_STATUS_CHOISES = (
    (1, 'Создано'),
    (2, 'Открыто'),
    (3, 'На проверке'),
    (4, 'Принято'),
    (5, 'На доработке'),
    (6, 'Отменено'),
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

    class Meta:
        verbose_name = 'Домашнее задание'
        verbose_name_plural = 'Домишние задания'
        ordering = ['-id']

    def __str__(self):
        return f'{self.name}'

    def get_status(self):
        return HomeworkLog.objects.filter(homework=self).first()

    async def aget_status(self):
        status = await HomeworkLog.objects.filter(homework=self).select_related("user").afirst()
        return status

    async def aopen(self):
        await HomeworkLog.objects.acreate(homework=self,
                                          user=self.listener,
                                          status=2,
                                          comment="Домашнее задание открыто")

    def open(self):
        HomeworkLog.objects.create(homework=self,
                                   user=self.listener,
                                   status=2,
                                   comment="Домашнее задание открыто")


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

    class Meta:
        verbose_name = 'Лог ДЗ'
        verbose_name_plural = 'Логи ДЗ',
        ordering = ['-dt']

    def __str__(self):
        return f'{self.user} - {self.status}'


def homework_new_log(sender, instance, created, **kwargs):
    if created:
        HomeworkLog.objects.create(homework=instance,
                                   user=instance.teacher,
                                   comment="Домашнее задание создано",
                                   status=1)


post_save.connect(homework_new_log, sender=Homework)
