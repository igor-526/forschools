from django.db import models
from profile_management.models import NewUser
from material.models import File

HANDLING_STATUS_CHOICES = (
    (0, 'Новая ошибка'),
    (1, 'В работе'),
    (2, 'Ошибка исправлена')
)

TICKETS_STATUS_CHOICES = (
    (0, 'Взята в работу'),
    (1, 'Проблема решена'),
    (2, 'Проблема не решена')
)


class WSGIErrorsLog(models.Model):
    user = models.ForeignKey(NewUser,
                             verbose_name="Пользователь",
                             on_delete=models.DO_NOTHING,
                             null=True,
                             blank=True)
    dt = models.DateTimeField(auto_now_add=True,
                              verbose_name="Дата и время ошибки",
                              null=False)
    exception = models.TextField(verbose_name="Ошибка",
                                 null=True)
    path_info = models.CharField(verbose_name="Путь",
                                 null=False)
    method = models.CharField(verbose_name="Метод",
                              null=False)
    status_code = models.IntegerField(verbose_name="Статус ответа",
                                      null=False)
    traceback_log = models.JSONField(verbose_name="Трейсбэк",
                                     null=False,
                                     default=list)
    params = models.JSONField(verbose_name="Параметры запроса",
                              null=False,
                              default=dict)
    handling_status = models.IntegerField(verbose_name="Статус обработки",
                                          null=False,
                                          default=0,
                                          choices=HANDLING_STATUS_CHOICES)


class SupportTicketAnswers(models.Model):
    user = models.ForeignKey(NewUser,
                             verbose_name="Пользователь",
                             on_delete=models.DO_NOTHING,
                             null=True,
                             blank=True,
                             related_name="tickets_set")
    dt = models.DateTimeField(auto_now_add=True,
                              verbose_name="Дата и время",
                              null=False,
                              blank=True)
    comment = models.TextField(verbose_name="Комментарий",
                               null=False,
                               blank=False,
                               max_length=3000)
    status = models.IntegerField(verbose_name="Статус",
                                 null=False,
                                 blank=False,
                                 default=0,
                                 choices=HANDLING_STATUS_CHOICES)
    read_by = models.ManyToManyField(NewUser,
                                     verbose_name="Прочитано",
                                     related_name="tickets_read_by",)


class SupportTicket(models.Model):
    path_info = models.CharField(verbose_name="Путь",
                                 null=True)
    attachments = models.ManyToManyField(File,
                                         verbose_name="Файлы",
                                         )
    description = models.TextField(verbose_name="Комментарий",
                                   null=False,
                                   blank=False,
                                   max_length=3000
                                   )
    answers = models.ManyToManyField(SupportTicketAnswers,
                                     verbose_name="Ответы",
                                     )
    dt = models.DateTimeField(auto_now_add=True,
                              verbose_name="Дата и время",
                              null=False,
                              blank=True)
