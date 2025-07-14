from django.db import models

from material.models import File

from profile_management.models import NewUser, Telegram

HANDLING_STATUS_CHOICES = (
    (0, 'Новая ошибка'),
    (1, 'В работе'),
    (2, 'Ошибка исправлена')
)

ACTION_TYPE_CHOICES = (
    (0, 'Сообщение'),
    (1, 'Callback'),
    (2, 'Добавление материала')
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
    response = models.JSONField(verbose_name="Ответ сервера",
                                null=True)


class TelegramErrorsLog(models.Model):
    action_type = models.IntegerField(verbose_name="Тип события",
                                      null=False,
                                      default=0,
                                      choices=ACTION_TYPE_CHOICES)
    tg_id = models.BigIntegerField(verbose_name="Telegram ID",
                                   null=False)
    tg_note = models.ForeignKey(Telegram,
                                on_delete=models.SET_NULL,
                                null=True,
                                verbose_name="Запись Telegram")
    error = models.TextField(verbose_name="Ошибка",
                             null=True)
    traceback_log = models.JSONField(verbose_name="Трейсбэк",
                                     null=False,
                                     default=list)
    params = models.JSONField(verbose_name="Параметры запроса",
                              null=False,
                              default=dict)
    dt = models.DateTimeField(auto_now_add=True,
                              verbose_name="Дата и время ошибки",
                              null=False)
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
                             related_name="ticketsanswers_set")
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
                                     related_name="ticketsanswers_read_by",)


class SupportTicket(models.Model):
    user = models.ForeignKey(NewUser,
                             verbose_name="Пользователь",
                             on_delete=models.DO_NOTHING,
                             null=True,
                             blank=True,)
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

    def get_status(self):
        return self.answers.order_by("-dt").first()
