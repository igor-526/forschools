from datetime import date, datetime, timedelta

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Count, Q

from learning_plan.utils import (Rescheduling,
                                 get_schedule,
                                 plan_rescheduling_info)

from material.models import Material

from profile_management.models import NewUser

from rest_framework import status
from rest_framework.generics import (ListAPIView,
                                     ListCreateAPIView,
                                     RetrieveUpdateDestroyAPIView)
from rest_framework.response import Response
from rest_framework.views import APIView

from tgbot.utils import (notify_lesson_passed,
                         send_homework_tg,
                         send_materials,
                         sync_funcs)

from user_logs.models import UserLog

from .models import Lesson, LessonTeacherReview, Place
from .permissions import (CanEditLessonAdminComment,
                          CanReplaceTeacherMixin,
                          CanSetNotHeldMixin,
                          can_set_passed,
                          lesson_perm_can_set_not_held,
                          lesson_perm_can_set_replace)
from .serializers import LessonListSerializer, LessonSerializer
from .validators import validate_lesson_review_form


class LessonListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
    model = Lesson
    serializer_class = LessonListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request,
                     'phase_pk': kwargs.get('phase_pk')}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status.HTTP_201_CREATED)


class LessonListAPIView(LoginRequiredMixin, ListAPIView):
    model = Lesson
    serializer_class = LessonListSerializer

    def filter_all(self, queryset):
        query = dict()
        lesson_status = self.request.query_params.get("status")
        ds = self.request.query_params.get("date_start")
        de = self.request.query_params.get("date_end")
        teachers = self.request.query_params.getlist("teacher")
        listeners = self.request.query_params.getlist("listener")
        methodists = self.request.query_params.getlist("methodist")
        has_hw = self.request.query_params.get("has_hw")
        name = self.request.query_params.get("name")
        has_comment = self.request.query_params.get("comment")
        hw_agreement = self.request.query_params.get("hw_agreement")
        hw_statuses = self.request.query_params.getlist("hw_status")
        lesson_places = self.request.query_params.getlist("place")
        if lesson_status:
            query['status'] = lesson_status
        if ds:
            query['date__gte'] = ds
        else:
            if not (teachers or listeners or methodists or
                    has_hw or name or has_comment or hw_agreement or
                    hw_statuses or lesson_places):
                query['date__gte'] = date.today() - timedelta(days=2)
        if de:
            query['date__lte'] = de
        else:
            if not (teachers or listeners or methodists or
                    has_hw or name or has_comment or hw_agreement or
                    hw_statuses or lesson_places):
                query['date__lte'] = date.today() + timedelta(days=6)
        if listeners:
            query['learningphases__learningplan__listeners__in'] = listeners
        if methodists:
            query['learningphases__learningplan__metodist__in'] = methodists
        if has_hw == "false":
            query['hw_count'] = 0
        elif has_hw == "true":
            query['hw_count__gt'] = 0
        if name:
            query['name__icontains'] = name
        if lesson_places:
            query['place__in'] = lesson_places
        if has_comment == "false" and self.request.user.groups.filter(
                name="Admin"
        ).exists():
            query['admin_comment__isnull'] = True
        elif has_comment == "true" and self.request.user.groups.filter(
                name="Admin"
        ).exists():
            query['admin_comment__isnull'] = False

        if query:
            queryset = queryset.filter(**query)
        if teachers and queryset:
            queryset = queryset.filter(
                Q(learningphases__learningplan__teacher_id__in=teachers) |
                Q(replace_teacher_id__in=teachers)
            )
        if queryset and (hw_agreement or hw_statuses):
            listed_queryset = list(queryset)
            filtered_queryset = list(filter(
                lambda lesson: self.filter_hw(lesson,
                                              hw_statuses,
                                              hw_agreement),
                listed_queryset
            ))
            if not filtered_queryset:
                return None
            queryset = Lesson.objects.filter(
                id__in=[lesson.id for lesson in filtered_queryset]
            )
        return queryset

    def filter_hw(self, lesson: Lesson, hw_statuses, hw_agreement):
        homework_statuses = [hw.get_status() for hw in lesson.homeworks.all()]
        for hw_status in homework_statuses:
            if hw_agreement and hw_status.agreement.get("accepted") is False:
                return True
            if (hw_statuses and hw_status.status in
                    [int(st) for st in hw_statuses]):
                return True
        return False

    def get_queryset(self, *args, **kwargs):
        if self.request.user.groups.filter(name="Admin").exists():
            queryset = Lesson.objects.all()
        elif self.request.user.groups.filter(name="Metodist").exists():
            queryset = Lesson.objects.filter(
                learningphases__learningplan__teacher=self.request.user
            )
        elif self.request.user.groups.filter(name="Teacher").exists():
            queryset = Lesson.objects.filter(
                Q(learningphases__learningplan__teacher=self.request.user) |
                Q(replace_teacher=self.request.user)
            )
        elif self.request.user.groups.filter(name="Listener").exists():
            queryset = Lesson.objects.filter(
                learningphases__learningplan__listeners=self.request.user
            )
        else:
            queryset = None
        if self.request.user.groups.filter(name="Curator").exists():
            if queryset is not None:
                queryset = Lesson.objects.filter(
                    Q(learningphases__learningplan__curators=(
                        self.request.user)) |
                    Q(id__in=[lesson.id for lesson in queryset])
                )
            else:
                queryset = Lesson.objects.filter(
                    learningphases__learningplan__curators=self.request.user
                )
        queryset = self.filter_all(
            queryset.annotate(hw_count=Count("homeworks"))
        )
        offset = int(self.request.query_params.get("offset")) if (
            self.request.query_params.get("offset")) else 0
        return (queryset.order_by("date", "start_time").distinct()
                [offset:offset + 50] if queryset is not None else None)


class LessonAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer


class LessonAdminCommentAPIView(CanEditLessonAdminComment, APIView):
    def get_object(self, lesson_id) -> Lesson | None:
        try:
            return Lesson.objects.get(pk=lesson_id)
        except Lesson.DoesNotExist:
            return None

    def post(self, request, *args, **kwargs):
        lesson = self.get_object(self.kwargs.get('pk'))
        if lesson is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        comment = request.POST.get('comment')
        plan = lesson.get_learning_plan()
        if not comment:
            UserLog.objects.create(
                log_type=5,
                learning_plan=plan,
                title="Администратор удалил комментарий по занятию",
                content={
                    "list": [],
                    "text": [lesson.admin_comment]
                },
                buttons=[{"inner": f'Занятие: {lesson.name}',
                          "href": f"/lessons/{lesson.id}"}],
                color="danger",
                user=request.user
            )
            lesson.admin_comment = None
            lesson.save()
            return Response(
                data=LessonListSerializer(instance=lesson,
                                          many=False,
                                          context={'request': request}).data,
                status=status.HTTP_200_OK
            )
        comment = comment.strip()
        if len(comment) > 2000:
            return Response(
                data={'comment': 'Длина комментария не может превышать '
                                 '2000 символов'},
                status=status.HTTP_400_BAD_REQUEST
            )
        lesson.admin_comment = comment
        lesson.save()
        UserLog.objects.create(
            log_type=5,
            learning_plan=plan,
            title="Администратор прокомментировал занятие",
            content={
                "list": [],
                "text": [lesson.admin_comment]
            },
            buttons=[{"inner": f'Занятие: {lesson.name}',
                      "href": f"/lessons/{lesson.id}"}],
            user=request.user
        )
        return Response(
            data=LessonListSerializer(instance=lesson,
                                      many=False,
                                      context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class LessonSetMaterialsAPIView(LoginRequiredMixin, APIView):
    def post(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
            lesson_materials_old = [mat.id for mat in lesson.materials.all()]
            lesson_materials_new = request.data.get('materials')
            lesson.materials.set(lesson_materials_new)
            lesson.save()
            if lesson.status == 1:
                new_materials = list(filter(
                    lambda mat: mat not in lesson_materials_old,
                    lesson_materials_new
                ))
                if new_materials:
                    for listener in lesson.get_learning_plan().listeners.all():
                        send_materials(
                            request.user,
                            listener,
                            Material.objects.filter(id__in=new_materials),
                            "auto"
                        )
        except Exception as e:
            return Response(data={'error': str(e)},
                            status=status.HTTP_400_BAD_REQUEST)
        return Response(data={'status': 'ok'})

    def delete(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
            materials = request.data.get('materials')
            lesson.materials.remove(*materials)
            lesson.save()
            return Response(data={'status': 'ok'},
                            status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(data={'error': str(e)},
                            status=status.HTTP_400_BAD_REQUEST)


class LessonReplaceTeacherAPIView(CanReplaceTeacherMixin, APIView):
    def patch(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
        except Lesson.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if (not lesson_perm_can_set_replace(
                lesson=lesson,
                is_admin=self.request.user.groups.filter(
                    name='Admin').exists(),
        )):
            return Response(status=status.HTTP_403_FORBIDDEN)
        teacher_id = request.data.get('teacher_id')
        if teacher_id is None:
            return Response(data={"error": "Пользователь не найден"},
                            status=status.HTTP_400_BAD_REQUEST)
        if lesson.get_learning_plan().teacher.id == int(teacher_id):
            lesson.replace_teacher = None
            lesson.save()
            return Response(
                data=LessonSerializer(lesson,
                                      context={"request": request}).data,
                status=status.HTTP_200_OK
            )
        try:
            new_teacher = NewUser.objects.get(pk=teacher_id)
        except NewUser.DoesNotExist:
            return Response(data={"error": "Пользователь не найден"},
                            status=status.HTTP_400_BAD_REQUEST)
        if not new_teacher.groups.filter(name="Teacher").exists():
            return Response(data={"error": "Пользователь не является "
                                           "преподавателем"},
                            status=status.HTTP_400_BAD_REQUEST)
        lesson.replace_teacher = new_teacher
        lesson.save()
        return Response(
            data=LessonSerializer(lesson,
                                  context={"request": request}).data,
            status=status.HTTP_200_OK
        )


class LessonSetPassedAPIView(LoginRequiredMixin, APIView):
    def notify_users(self, plan_, lesson_: Lesson,
                     user_: NewUser, tg_id: str | None) -> None:
        for listener in lesson_.get_listeners():
            for hw in lesson_.homeworks.filter(listener=listener):
                res = hw.set_assigned()
                if res and res.get("agreement") is False:
                    send_homework_tg(user_,
                                     listener,
                                     [hw])
                    if hw.for_curator:
                        for curator in plan_.curators.all():
                            send_homework_tg(
                                initiator=user_,
                                listener=curator,
                                homeworks=[hw],
                                text="Преподаватель задал ДЗ"
                            )
                else:
                    send_homework_tg(
                        initiator=user_,
                        listener=plan_.metodist,
                        homeworks=[hw],
                        text="Преподаватель задал ДЗ. "
                             "Требуется согласование"
                    )
        if tg_id:
            notify_lesson_passed(
                tg_id=int(tg_id),
                text="Занятие успешно проведено!",
                lesson_id=lesson_.id
            )

    def log_admin(self, lesson_: Lesson, user_: NewUser) -> None:
        UserLog.objects.create(
            log_type=2,
            color="success",
            learning_plan=lesson_.get_learning_plan(),
            title=f"Занятие '{lesson_.name}' от "
                  f"{lesson_.date.strftime('%d.%m.%Y')} "
                  f"проведено",
            content={
                "list": [],
                "text": ["Занятие было помечено проведённым "
                         "АДМИНИСТРАТОРОМ"]
            },
            buttons=[{
                "href": f"/lessons/{lesson_.id}",
                "inner": "Занятие"
            }],
            user=user_
        )

    def post(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
            plan = lesson.get_learning_plan()
        except Lesson.DoesNotExist:
            return Response(data={'error': "Занятие не найдено"},
                            status=status.HTTP_400_BAD_REQUEST)
        if lesson.status == 1:
            return Response(data={'error': "Занятие уже проведено"},
                            status=status.HTTP_400_BAD_REQUEST)
        is_admin = request.user.groups.filter(name='Admin').exists()
        if not is_admin and lesson.homeworks.count() == 0:
            return Response(data={'error': "Необходимо задать ДЗ"},
                            status=status.HTTP_400_BAD_REQUEST)
        if not can_set_passed(request, lesson):
            return Response(data={'error': "Недостаточно прав для "
                                           "изменения статуса занятия"},
                            status=status.HTTP_400_BAD_REQUEST)

        validation = validate_lesson_review_form(
            data=request.POST,
            name_only=plan.can_report_lesson_name_only or is_admin
        )
        review = LessonTeacherReview.objects.create(
            **validation.get("review")
        ) if (validation.get("status") and len(validation.get("review")) > 0) \
            else None
        lesson_name = request.POST.get("name").strip(" ") if (
            request.POST.get("name")) else None
        if validation.get("status") or is_admin:
            lesson.name_fact = lesson_name
            lesson.lesson_teacher_review = review
            lesson.status = 1
            lesson.save()
            if is_admin:
                self.log_admin(lesson, request.user)
            self.notify_users(plan_=plan,
                              lesson_=lesson,
                              user_=request.user,
                              tg_id=request.POST.get("notify_tg_id"))
        else:
            return Response(
                data={'errors': validation.get("errors")},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(data={'status': 'ok'},
                        status=status.HTTP_200_OK)


class LessonSetNotHeldAPIView(CanSetNotHeldMixin, APIView):
    def get_review_form_list_data(self, rf):
        list_data = []
        if rf and rf.materials:
            list_data.append({
                "name": "Используемые материалы",
                "val": rf.materials
            })
        if rf and rf.lexis:
            list_data.append({
                "name": "Лексика",
                "val": rf.lexis
            })
        if rf and rf.grammar:
            list_data.append({
                "name": "Грамматика",
                "val": rf.grammar
            })
        if rf and rf.note:
            list_data.append({
                "name": "Примечание",
                "val": rf.note
            })
        if rf and rf.org:
            list_data.append({
                "name": "Орг. моменты и поведение ученика",
                "val": rf.org
            })
        if rf and rf.org:
            list_data.append({
                "name": "Дата и время заоплнения формы",
                "val": rf.dt.strftime('%d.%m.%Y %H:%M')
            })
        return list_data

    def post(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
        except Lesson.DoesNotExist:
            return Response(data={'error': "Занятие не найдено"},
                            status=status.HTTP_400_BAD_REQUEST)
        if lesson.status == 0:
            return Response(data={'error': "Занятие не проведено"},
                            status=status.HTTP_400_BAD_REQUEST)
        if not lesson_perm_can_set_not_held(
                lesson=lesson,
                is_admin=request.user.groups.filter(name="Admin").exists()
        ):
            return Response(status=status.HTTP_403_FORBIDDEN)

        lesson.status = 0
        lesson.save()
        serialized_lesson = LessonSerializer(
            lesson,
            context={'request': request}
        )
        UserLog.objects.create(
            log_type=2,
            color="danger",
            learning_plan=lesson.get_learning_plan(),
            title=f"Занятие '{lesson.name}' от "
                  f"{lesson.date.strftime('%d.%m.%Y')} "
                  f"помечено непроведённым",
            content={
                "list": self.get_review_form_list_data(
                    lesson.lesson_teacher_review
                ),
                "text": ["Занятие было помечено непроведённым"]
            },
            buttons=[{
                "href": f"/lessons/{lesson.id}",
                "inner": "Занятие"
            }],
            user=request.user
        )
        if lesson.lesson_teacher_review:
            lesson.lesson_teacher_review.delete()
            lesson.lesson_teacher_review = None
        return Response(data=serialized_lesson.data,
                        status=status.HTTP_200_OK)


class UserLessonListAPIView(LoginRequiredMixin, ListAPIView):
    serializer_class = LessonListSerializer

    def get_queryset(self, *args, **kwargs):
        user_id = self.kwargs.get('pk')
        return Lesson.objects.filter(
            learningphases__learningplan__listeners__id=user_id
        )


class PlansItemRescheduling(LoginRequiredMixin, APIView):
    def get_lessons(self, *args, **kwargs):
        lesson_id = kwargs.get('pk')
        lesson = Lesson.objects.get(pk=lesson_id)
        phase = lesson.learningphases_set.first()
        phases = phase.learningplan_set.first().phases.filter(
            lessons__date__gte=lesson.date
        ).distinct()
        lessons_set = []
        for ph in phases:
            lessons_set += [p for p in ph.lessons.filter(
                date__gte=lesson.date
            ).distinct()]
        return lessons_set

    def validate_item_rescheduling(self, request, lesson, *args, **kwargs):
        errors = ""
        req_date = request.data.get('date')
        req_start = request.data.get('start')
        req_end = request.data.get('end')
        if not req_date:
            return {"status": "ok", "errors": "", "warnings": ""}
        if req_date == "":
            errors += ("Необходимо указать дату занятия, либо "
                       "выключить ручной выбор даты и времени")
        if req_start is not None and req_start == "":
            errors += ("Необходимо указать время начала занятия, "
                       "либо выключить ручной выбор даты и времени")
        if req_end is not None and req_end == "":
            errors += ("Необходимо указать время окончания занятия, "
                       "либо выключить ручной выбор даты и времени")
        if (req_start is not None and req_end is not None and
                req_start != "" and req_end != ""):
            req_start = datetime.strptime(req_start,
                                          "%H:%M").time()
            req_end = datetime.strptime(req_end,
                                        "%H:%M").time()
            if req_end <= req_start:
                errors += ("Время окончания занятия не может быть "
                           "раньше или равным времени началу занятия")
        if errors:
            return {"status": "error", "errors": errors, "warnings": ""}
        warns = ""
        if not request.data.get("ignore_warnings"):
            next_lesson = Lesson.objects.filter(date__gt=lesson.date).first()
            if next_lesson:
                lesson_et = datetime.combine(req_date, req_end)
                next_lesson_st = datetime.combine(next_lesson.date,
                                                  lesson.start_time)
                if lesson_et > next_lesson_st:
                    warns += (f'Вы устанавливаете дату и время занятия '
                              f'во время либо после '
                              f'<a href="/lessons/{next_lesson.id}">'
                              f'следующего занятия</a>')
            place = request.data.get("place")
            if place != "None":
                place = Place.objects.get(pk=place)
                has_lessons = place.has_lessons(req_date, req_start, req_end)
                if has_lessons:
                    warns += (f'<li>Данное место проведения будет занято '
                              f'<a href="/lessons/{has_lessons.id}">'
                              f'следующим занятием</a></li>')

        return {
            "status": "ok" if not warns and not errors else "error",
            "warnings": warns,
            "errors": errors
        }

    def validate_plan_rescheduling(self, params, *args, **kwargs):
        pass

    def get(self, request, *args, **kwargs):
        lesson_id = kwargs.get('pk')
        try:
            lesson = Lesson.objects.get(pk=lesson_id)
        except Lesson.DoesNotExist:
            return Response(
                data={"errors": "Занятие не найдено<br>"
                                "Обновите страницу и повторите попытку"}
            )
        return Response(
            plan_rescheduling_info(
                datetime.strptime(request.query_params.get("date_start"),
                                  "%Y-%m-%d"),
                get_schedule(request.query_params),
                lesson
            ), status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        lessons = self.get_lessons(self, *args, **kwargs)
        schedule = get_schedule(request.POST)
        plan = lessons[0].get_learning_plan()
        plan.schedule = schedule
        plan.save()
        rescheduler = Rescheduling(
            first_date=datetime.strptime(request.POST.get("date_start"),
                                         "%Y-%m-%d"),
            lessons=lessons,
            schedule=schedule
        )

        rescheduler.set_lessons_dt()
        return Response(data={'status': 'ok'},
                        status=status.HTTP_201_CREATED)

    def patch(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
        except Lesson.DoesNotExist:
            return Response(data={
                'errors': "Занятие не найдено<br>Обновите страницу "
                          "и повторите попытку"
            },
                status=status.HTTP_400_BAD_REQUEST)
        validation = self.validate_item_rescheduling(request,
                                                     lesson,
                                                     *args,
                                                     **kwargs)
        if validation['status'] == "error":
            return Response(data=validation,
                            status=status.HTTP_400_BAD_REQUEST)
        if request.data.get("action") == 'cancel':
            if request.data.get("date"):
                new_lesson = Lesson.objects.create(
                    name=lesson.name,
                    start_time=datetime.strptime(request.data.get("start"),
                                                 "%H:%M").time(),
                    end_time=datetime.strptime(request.data.get("end"),
                                               "%H:%M").time(),
                    date=datetime.strptime(request.data.get("date"),
                                           "%Y-%m-%d"),
                    description=lesson.description,
                    replace_teacher=lesson.replace_teacher,
                    materials_access=lesson.materials_access,
                    place=lesson.place
                )
                new_lesson.materials.set(lesson.materials.all())
                new_lesson.homeworks.set(lesson.homeworks.all())
                new_lesson.save()
                phase = lesson.learningphases_set.first()
                phase.lessons.add(new_lesson)
                phase.save()
                lesson.status = 2
                lesson.save()
                return Response(data={'status': 'ok'},
                                status=status.HTTP_201_CREATED)
            else:
                pass
        else:
            if request.data.get("date"):
                lesson.start_time = datetime.strptime(
                    request.data.get("start"), "%H:%M"
                ).time()
                lesson.end_time = datetime.strptime(
                    request.data.get("end"), "%H:%M"
                ).time()
                lesson.date = datetime.strptime(request.data.get("date"),
                                                "%Y-%m-%d")
                lesson.save()
                return Response(data={'status': 'ok'},
                                status=status.HTTP_201_CREATED)
            pass
        return Response(data={'errors': 'Функция в разработке'},
                        status=status.HTTP_400_BAD_REQUEST)


class LessonRestoreAPIView(LoginRequiredMixin, APIView):
    def restore_info(self, lesson):
        pr_lesson = lesson.from_program_lesson
        lesson.name = pr_lesson.name
        lesson.description = pr_lesson.description
        lesson.save()

    def restore_materials(self, lesson):
        pr_lesson = lesson.from_program_lesson
        lesson.materials.set(pr_lesson.materials.all())
        lesson.save()

    def restore_homeworks(self, lesson):
        pr_lesson = lesson.from_program_lesson
        homeworks = lesson.homeworks.all()
        teacher = lesson.get_teacher()
        listeners = lesson.get_listeners()
        for homework in homeworks:
            logs = homework.log.all()
            logs.delete()
        homeworks.delete()
        pr_homeworks = pr_lesson.homeworks.all()
        for hw in pr_homeworks:
            for listener in listeners:
                new_hw = lesson.homeworks.create(
                    name=hw.name,
                    description=hw.description,
                    teacher=teacher,
                    listener=listener,
                    from_programs_hw_id=hw.id,
                    deadline=lesson.date + timedelta(days=7)
                )
                new_hw.materials.set(hw.materials.all())
                new_hw.save()

    def patch(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
        except Lesson.DoesNotExist:
            return Response(data={"status": "error"},
                            status=status.HTTP_400_BAD_REQUEST)
        if not lesson.from_program_lesson:
            return Response(data={"status": "error"},
                            status=status.HTTP_400_BAD_REQUEST)
        restore_info = request.POST.get("info")
        restore_materials = request.POST.get("materials")
        restore_homeworks = request.POST.get("homeworks")
        if restore_info:
            self.restore_info(lesson)
        if restore_materials:
            if lesson.status != 3:
                self.restore_materials(lesson)
        if restore_homeworks:
            if lesson.status == 0:
                self.restore_homeworks(lesson)
        return Response(data=LessonSerializer(lesson).data,
                        status=status.HTTP_200_OK)


class ScheduleAPIView(LoginRequiredMixin, APIView):
    monday: datetime
    sunday: datetime
    week_info: str

    def get_lessons(self, user_id: int, usergroups: list):
        q = None
        if "Listener" in usergroups:
            q = Lesson.objects.filter(
                learningphases__learningplan__listeners__id=user_id,
                date__gte=self.monday,
                date__lte=self.sunday
            )

        if "Teacher" in usergroups:
            q = Lesson.objects.filter(
                Q(learningphases__learningplan__teacher__id=user_id,
                  date__gte=self.monday,
                  date__lte=self.sunday) |
                Q(replace_teacher__id=user_id,
                  date__gte=self.monday,
                  date__lte=self.sunday)
            )
        return q

    def set_week_info(self):
        offset = int(self.request.query_params.get("offset")) if (
            self.request.query_params.get("offset")) else 0
        sel_date = datetime.today() + timedelta(days=offset * 7)
        self.monday = sel_date - timedelta(days=sel_date.weekday())
        self.sunday = self.monday + timedelta(days=6)
        self.week_info = (f'{self.monday.strftime("%d.%m.%y")} - '
                          f'{self.sunday.strftime("%d.%m.%y")}')

    def get_schedule(self, lessons, usergroups: list):
        def get_lesson_info(lsn: Lesson):
            if lsn.start_time and lsn.end_time:
                l_time = (f"{lsn.start_time.strftime('%H:%M')}-"
                          f"{lsn.end_time.strftime('%H:%M')}")
            else:
                l_time = "Без времени"
            if "Listener" in usergroups:
                teacher = lesson.get_teacher()
                participants = [f'{teacher.first_name} {teacher.last_name}']
            else:
                participants = [f'{u.first_name} {u.last_name}' for u in
                                lesson.get_listeners()]
            return {
                "participants": participants,
                "time": l_time,
                "id": lsn.id,
                "status": lsn.status
            }

        schedule = {
            "monday": [],
            "tuesday": [],
            "wednesday": [],
            "thursday": [],
            "friday": [],
            "saturday": [],
            "sunday": []
        }
        if lessons:
            for lesson in lessons:
                if lesson.date.weekday() == 0:
                    schedule["monday"].append(get_lesson_info(lesson))
                elif lesson.date.weekday() == 1:
                    schedule["tuesday"].append(get_lesson_info(lesson))
                elif lesson.date.weekday() == 2:
                    schedule["wednesday"].append(get_lesson_info(lesson))
                elif lesson.date.weekday() == 3:
                    schedule["thursday"].append(get_lesson_info(lesson))
                elif lesson.date.weekday() == 4:
                    schedule["friday"].append(get_lesson_info(lesson))
                elif lesson.date.weekday() == 5:
                    schedule["saturday"].append(get_lesson_info(lesson))
                elif lesson.date.weekday() == 6:
                    schedule["sunday"].append(get_lesson_info(lesson))
        return schedule

    def get(self, request, *args, **kwargs):
        self.set_week_info()
        if kwargs.get("pk") == 0:
            user = request.user
        else:
            user = NewUser.objects.get(pk=kwargs.get("pk"))
        usergroups = [g.name for g in user.groups.all()]
        lessons = self.get_lessons(user.id, usergroups)
        schedule = self.get_schedule(lessons, usergroups)
        return Response({
            "week_text": self.week_info,
            "schedule": schedule,
            "count": len(lessons) if lessons else 0
        }, status=status.HTTP_200_OK)


class LessonSetAdditionalListeners(CanReplaceTeacherMixin, APIView):
    def post(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
        except Lesson.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        new_add_listeners = NewUser.objects.filter(
            id__in=request.POST.getlist("additional_listener"),
            groups__name="Listener"
        ).exclude(
            id__in=lesson.get_learning_plan().listeners.values_list(
                "id", flat=True
            )
        )
        lesson.additional_listeners.set(new_add_listeners)
        return Response(
            data=LessonSerializer(lesson,
                                  context={'request': request}).data,
            status=status.HTTP_200_OK
        )


class LessonSendPlaceTGAPIVIew(LoginRequiredMixin, APIView):
    def post(self, request, *args, **kwargs):
        if not request.POST.get("tg_id"):
            return Response(data={"status": "error",
                                  "error": "Отсутвует информация о Telegram"},
                            status=status.HTTP_400_BAD_REQUEST)
        result = sync_funcs.send_lesson_place(kwargs["pk"],
                                              request.POST.get("tg_id"))
        if result['status']:
            return Response(data={"status": "success"},
                            status=status.HTTP_200_OK)
        return Response(data={"status": "error",
                              "error": result['error']},
                        status=status.HTTP_400_BAD_REQUEST)
