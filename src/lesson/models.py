from typing import List

from django.db import models
from django.db.models import QuerySet
from django.utils import timezone

from homework.models import Homework

from learning_program.models import LearningProgramLesson

from material.models import Material

from profile_management.models import NewUser

LESSON_STATUS_CHOICES = (
    (0, 'Не проведён'),
    (1, 'Проведён'),
    (2, 'Отменён')
)


class Place(models.Model):
    name = models.CharField(verbose_name='Наименование',
                            max_length=200,
                            null=False,
                            blank=False,
                            unique=True)
    url = models.URLField(verbose_name='Ссылка',
                          null=False,
                          blank=False,
                          unique=True)
    conf_id = models.CharField(verbose_name='Идентификатор конференции',
                               max_length=200,
                               null=True,
                               blank=True)
    access_code = models.CharField(verbose_name='Код доступа',
                                   max_length=200,
                                   null=True,
                                   blank=True)

    class Meta:
        verbose_name = 'Место проведения занятия'
        verbose_name_plural = 'Места проведения занятий'
        ordering = ['name']

    def __str__(self):
        return f'{self.name}'

    def has_lessons(self, date, ts, te):
        lessons = self.lesson_set.filter(date=date).all()
        for lesson in lessons:
            latest_start = max(ts, lesson.start_time)
            earliest_end = min(te, lesson.end_time)
            if latest_start < earliest_end:
                return lesson
        return None


class LessonTeacherReview(models.Model):
    materials = models.CharField(verbose_name='Используемые материалы',
                                 max_length=2000,
                                 null=False,
                                 blank=False)
    lexis = models.CharField(verbose_name='Лексика',
                             max_length=300,
                             null=False,
                             blank=False)
    grammar = models.CharField(verbose_name='Грамматика',
                               max_length=300,
                               null=False,
                               blank=False)
    note = models.CharField(verbose_name='Примечание',
                            max_length=2000,
                            null=False,
                            blank=False)
    org = models.CharField(verbose_name='Орг. моменты и поведение ученика',
                           max_length=2000,
                           null=False,
                           blank=False)
    dt = models.DateTimeField(verbose_name='Дата и время заполнения',
                              auto_now_add=True,
                              null=True,
                              blank=True)

    class Meta:
        verbose_name = 'Отзыв преподавателя о занятии'
        verbose_name_plural = 'Отзывы преподавателей о занятиях'


class Lesson(models.Model):
    name = models.CharField(verbose_name='Наименование по плану',
                            max_length=200,
                            null=False,
                            blank=False)
    name_fact = models.CharField(verbose_name='Наименование фактическое',
                                 max_length=200,
                                 null=True,
                                 blank=True)
    start_time = models.TimeField(verbose_name='Начало занятия',
                                  null=True,
                                  blank=True)
    end_time = models.TimeField(verbose_name='Окончание занятия',
                                null=True,
                                blank=True)
    date = models.DateField(verbose_name='Дата занятия',
                            null=True,
                            blank=True,
                            default=timezone.now)
    description = models.TextField(verbose_name='Описание занятия',
                                   null=True,
                                   blank=True)
    replace_teacher = models.ForeignKey(
        to="profile_management.NewUser",
        verbose_name='Замещающий преподаватель',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='replace_teacher'
    )
    additional_listeners = models.ManyToManyField(
        to="profile_management.NewUser",
        verbose_name='Дополнительные ученики',
        related_name='additional_listeners'
    )
    materials = models.ManyToManyField(Material,
                                       verbose_name='Материалы',
                                       related_name='lesson',
                                       related_query_name='lesson_set',
                                       blank=True)
    materials_access = models.BooleanField(verbose_name="Видимость материалов",
                                           null=False,
                                           default=False,
                                           blank=True)
    homeworks = models.ManyToManyField(Homework,
                                       verbose_name='Домашние задания',
                                       blank=True)
    place = models.ForeignKey(Place,
                              verbose_name='Место занятия',
                              null=True,
                              blank=True,
                              on_delete=models.DO_NOTHING)
    status = models.IntegerField(verbose_name='Статус',
                                 default=0,
                                 null=False,
                                 blank=True,
                                 choices=LESSON_STATUS_CHOICES)
    from_program_lesson = models.ForeignKey(
        LearningProgramLesson,
        verbose_name="Шаблон урока программы",
        null=True,
        blank=True,
        on_delete=models.DO_NOTHING
    )
    lesson_teacher_review = models.ForeignKey(
        LessonTeacherReview,
        verbose_name="Отзыв преподавателя",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    admin_comment = models.TextField(
        verbose_name="комментарий администратора",
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = 'Занятие'
        verbose_name_plural = 'Занятия'
        ordering = ['date', 'start_time', 'pk']

    def __str__(self):
        return f'{self.name} - {self.date}'

    def get_teacher(self) -> NewUser:
        if self.replace_teacher:
            return self.replace_teacher
        else:
            return self.get_learning_plan().teacher

    async def aget_teacher(self) -> NewUser:
        if self.replace_teacher:
            return self.replace_teacher
        else:
            lp = await self.aget_learning_plan()
            return lp.teacher

    def get_listeners(self) -> QuerySet[NewUser]:
        return NewUser.objects.filter(
            id__in=[*[listener.get("id") for listener in
                      self.get_learning_plan().listeners.all().values("id")],
                    *[listener.get("id") for listener in
                      self.additional_listeners.all().values("id")]]
        )

    async def aget_listeners(self) -> List[NewUser]:
        learning_phase = await self.learningphases_set.afirst()
        learning_plan = await learning_phase.learningplan_set.afirst()
        return [*[listener async for listener in
                  learning_plan.listeners.all()],
                *[listener async for listener in
                  self.additional_listeners.all()]]

    def get_hw_teacher(self):
        default_hw_teacher = self.get_learning_plan().default_hw_teacher
        if default_hw_teacher:
            return default_hw_teacher
        else:
            return self.get_teacher()

    def get_learning_plan(self):
        return self.learningphases_set.first().learningplan_set.first()

    async def aget_learning_plan(self):
        learning_phase = await self.learningphases_set.afirst()
        learning_plan = await (
            learning_phase.learningplan_set.select_related("teacher")
            .select_related("metodist").select_related("default_hw_teacher")
            .afirst()
        )
        return learning_plan

    def get_hw_deadline(self):
        nl = self.get_learning_plan().get_next_lesson(self)
        if not nl or not nl.date:
            return None
        return nl.date

    async def aset_passed(self):
        self.status = 1
        await self.asave()
