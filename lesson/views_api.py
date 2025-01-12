from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import status
from rest_framework.response import Response
from django.db.models import Q, Count
from rest_framework.generics import ListCreateAPIView, ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from learning_plan.utils import Rescheduling, get_schedule, plan_rescheduling_info
from material.models import Material
from profile_management.models import NewUser
from tgbot.utils import send_homework_tg, send_materials, notify_lesson_passed
from user_logs.models import UserLog
from .models import Lesson, Place, LessonTeacherReview
from .serializers import LessonListSerializer, LessonSerializer
from .permissions import CanReplaceTeacherMixin, can_set_passed, can_set_not_held
from datetime import datetime, timedelta, date
from .validators import validate_lesson_review_form


class LessonListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
    model = Lesson
    serializer_class = LessonListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data,
                                         context={'request': request,
                                                  'phase_pk': kwargs.get('phase_pk')})
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
        has_hw = self.request.query_params.get("has_hw")
        if lesson_status:
            query['status'] = lesson_status
        if ds:
            query['date__gte'] = ds
        else:
            query['date__gte'] = date.today() - timedelta(days=2)
        if de:
            query['date__lte'] = de
        else:
            query['date__lte'] = date.today() + timedelta(days=6)
        if listeners:
            query['learningphases__learningplan__listeners__in'] = listeners
        if has_hw == "false":
            query['hw_count'] = 0
        elif has_hw == "true":
            query['hw_count__gt'] = 0
        if query:
            queryset = queryset.filter(**query)
        if teachers:
            queryset = queryset.filter(
                Q(learningphases__learningplan__teacher_id__in=teachers) |
                Q(replace_teacher_id__in=teachers)
            )
        return queryset

    def get_queryset(self, *args, **kwargs):
        if self.request.user.groups.filter(name="Admin").exists():
            queryset = Lesson.objects.all()
        elif self.request.user.groups.filter(name="Metodist").exists():
            queryset = Lesson.objects.filter(learningphases__learningplan__teacher=self.request.user)
        elif self.request.user.groups.filter(name="Teacher").exists():
            queryset = Lesson.objects.filter(Q(learningphases__learningplan__teacher=self.request.user) |
                                             Q(replace_teacher=self.request.user))
        elif self.request.user.groups.filter(name="Listener").exists():
            queryset = Lesson.objects.filter(learningphases__learningplan__listeners=self.request.user)
        else:
            queryset = None
        if self.request.user.groups.filter(name="Curator").exists():
            if queryset is not None:
                queryset = Lesson.objects.filter(Q(learningphases__learningplan__curators=self.request.user) |
                                                 Q(id__in=[lesson.id for lesson in queryset]))
            else:
                queryset = Lesson.objects.filter(learningphases__learningplan__curators=self.request.user)
        queryset = self.filter_all(queryset.annotate(hw_count=Count("homeworks")))
        offset = int(self.request.query_params.get("offset")) if self.request.query_params.get("offset") else 0
        return queryset.order_by("date", "start_time").distinct()[offset:offset + 50] if queryset is not None else None


class LessonAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer


class LessonSetMaterialsAPIView(LoginRequiredMixin, APIView):
    def post(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
            lesson_materials_old = [mat.id for mat in lesson.materials.all()]
            lesson_materials_new = request.data.get('materials')
            lesson.materials.set(lesson_materials_new)
            lesson.save()
            if lesson.status == 1:
                new_materials = list(filter(lambda mat: mat not in lesson_materials_old, lesson_materials_new))
                if new_materials:
                    for listener in lesson.get_learning_plan().listeners.all():
                        send_materials(request.user, listener, Material.objects.filter(id__in=new_materials), "auto")
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'status': 'ok'})

    def delete(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
            materials = request.data.get('materials')
            lesson.materials.remove(*materials)
            lesson.save()
            return Response({'status': 'ok'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LessonReplaceTeacherAPIView(CanReplaceTeacherMixin, APIView):
    def patch(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
            lesson.replace_teacher_id = request.data.get('teacher_id')
            lesson.save()
            return Response({'status': 'ok'}, status=status.HTTP_200_OK)
        except Lesson.DoesNotExist:
            return Response({'error': 'Занятие не найдено'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LessonSetPassedAPIView(LoginRequiredMixin, APIView):
    def post(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
            plan = lesson.get_learning_plan()
        except Lesson.DoesNotExist:
            return Response({'error': "Занятие не найдено"}, status=status.HTTP_400_BAD_REQUEST)
        if lesson.status == 1:
            return Response({'error': "Занятие уже проведено"}, status=status.HTTP_400_BAD_REQUEST)
        is_admin = request.user.groups.filter(name='Admin').exists()
        if not is_admin and lesson.homeworks.count() == 0:
            return Response({'error': "Необходимо задать ДЗ"}, status=status.HTTP_400_BAD_REQUEST)
        if can_set_passed(request, lesson):
            validation = validate_lesson_review_form(request.POST)
            review = LessonTeacherReview.objects.create(**validation.get("review")) if validation.get("status") \
                else None
            lesson_name = request.POST.get("name").strip(" ") if request.POST.get("name") else None
            if is_admin:
                if lesson_name:
                    if len(lesson_name) < 200:
                        lesson.name = lesson_name
                    else:
                        return Response({'error': 'Наименование занятия не может быть более 200 символов'},
                                        status=status.HTTP_400_BAD_REQUEST)
                if review:
                    lesson.lesson_teacher_review = review
                else:
                    UserLog.objects.create(log_type=2,
                                           color="success",
                                           learning_plan=lesson.get_learning_plan(),
                                           title=f"Занятие '{lesson.name}' от {lesson.date.strftime('%d.%m.%Y')} "
                                                 f"проведено",
                                           content={
                                               "list": [],
                                               "text": ["Занятие было помечено проведённым АДМИНИСТРАТОРОМ"]
                                           },
                                           buttons=[{
                                               "href": f"/lessons/{lesson.id}",
                                               "inner": "Занятие"
                                           }],
                                           user=request.user)
                lesson.status = 1
                lesson.save()
            else:
                if validation.get("status"):
                    lesson.name = lesson_name
                    lesson.lesson_teacher_review = review
                    lesson.status = 1
                    lesson.save()
                else:
                    return Response({'error': "\n".join(validation.get("errors"))},
                                    status=status.HTTP_400_BAD_REQUEST)
            for listener in plan.listeners.all():
                for hw in lesson.homeworks.filter(listener=listener):
                    res = hw.set_assigned()
                    if res and res.get("agreement") is not None and res.get("agreement") is False:
                        send_homework_tg(request.user, listener, [hw])
                        if hw.for_curator:
                            for curator in plan.curators.all():
                                send_homework_tg(initiator=hw.teacher,
                                                 listener=curator,
                                                 homeworks=[hw],
                                                 text="Преподаватель задал ДЗ")
                    else:
                        send_homework_tg(initiator=hw.teacher,
                                         listener=plan.metodist,
                                         homeworks=[hw],
                                         text="Преподаватель задал ДЗ. Требуется согалсование")
            if request.POST.get("notify_tg_id"):
                notify_lesson_passed(tg_id=int(request.POST.get("notify_tg_id")),
                                     text="Занятие успешно проведено!",
                                     lesson_id=lesson.id)
            return Response({'status': 'ok'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': "Недостаточно прав для изменения статуса занятия"},
                            status=status.HTTP_400_BAD_REQUEST)


class LessonSetNotHeldAPIView(LoginRequiredMixin, APIView):
    def post(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
        except Lesson.DoesNotExist:
            return Response({'error': "Занятие не найдено"}, status=status.HTTP_400_BAD_REQUEST)
        if lesson.status != 0:
            if can_set_not_held(request, lesson):
                lesson.status = 0
                if lesson.lesson_teacher_review:
                    lesson.lesson_teacher_review.delete()
                    lesson.lesson_teacher_review = None
                lesson.save()
                serialized_lesson = LessonSerializer(lesson, context={'request': request})
                UserLog.objects.create(log_type=2,
                                       color="danger",
                                       learning_plan=lesson.get_learning_plan(),
                                       title=f"Занятие '{lesson.name}' от {lesson.date.strftime('%d.%m.%Y')} "
                                             f"помечено непроведённым",
                                       content={
                                           "list": [],
                                           "text": ["Занятие было помечено непроведённым"]
                                       },
                                       buttons=[{
                                           "href": f"/lessons/{lesson.id}",
                                           "inner": "Занятие"
                                       }],
                                       user=request.user)
                return Response(serialized_lesson.data, status=status.HTTP_201_CREATED)
            else:
                return Response({'error': "Недостаточно прав для изменения статуса занятия"},
                                    status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': "Занятие в статусе непроведённого"}, status=status.HTTP_400_BAD_REQUEST)


class UserLessonListAPIView(LoginRequiredMixin, ListAPIView):
    serializer_class = LessonListSerializer

    def get_queryset(self, *args, **kwargs):
        user_id = self.kwargs.get('pk')
        return Lesson.objects.filter(learningphases__learningplan__listeners__id=user_id)


class PlansItemRescheduling(LoginRequiredMixin, APIView):
    def get_lessons(self, *args, **kwargs):
        lesson_id = kwargs.get('pk')
        lesson = Lesson.objects.get(pk=lesson_id)
        phase = lesson.learningphases_set.first()
        phases = phase.learningplan_set.first().phases.filter(lessons__date__gte=lesson.date).distinct()
        lessons_set = []
        for ph in phases:
            lessons_set += [p for p in ph.lessons.filter(date__gte=lesson.date).distinct()]
        return lessons_set

    def validate_item_rescheduling(self, request, lesson, *args, **kwargs):
        errors = ""
        req_date = request.data.get('date')
        req_start = request.data.get('start')
        req_end = request.data.get('end')
        if not req_date:
            return {"status": "ok", "errors": "", "warnings": ""}
        if req_date == "":
            errors += "<li>Необходимо указать дату занятия, либо выключить ручной выбор даты и времени</li>"
        # else:
        # req_date = datetime.strptime(req_date, "%Y-%m-%d")
        # today = datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)
        # if req_date < today:
        #     errors += "<li>Дата занятия не может быть раньше, чем сегодня</li>"
        if req_start is not None and req_start == "":
            errors += "<li>Необходимо указать время начала занятия, либо выключить ручной выбор даты и времени</li>"
        if req_end is not None and req_end == "":
            errors += "<li>Необходимо указать время окончания занятия, либо выключить ручной выбор даты и времени</li>"
        if req_start is not None and req_end is not None and req_start != "" and req_end != "":
            req_start = datetime.strptime(req_start, "%H:%M").time()
            req_end = datetime.strptime(req_end, "%H:%M").time()
            if req_end <= req_start:
                errors += "<li>Время окончания занятия не может быть раньше или равным времени началу занятия</li>"
        if errors:
            return {"status": "error", "errors": errors, "warnings": ""}
        warns = ""
        if not request.data.get("ignore_warnings"):
            next_lesson = Lesson.objects.filter(date__gt=lesson.date).first()
            if next_lesson:
                lesson_et = datetime.combine(req_date, req_end)
                next_lesson_st = datetime.combine(next_lesson.date, lesson.start_time)
                if lesson_et > next_lesson_st:
                    warns += (f'<li>Вы устанавливаете дату и время занятия во время либо после '
                              f'<a href="/lessons/{next_lesson.id}" target="_blank">следующего занятия</a></li>')
            place = request.data.get("place")
            if place != "None":
                place = Place.objects.get(pk=place)
                has_lessons = place.has_lessons(req_date, req_start, req_end)
                if has_lessons:
                    warns += (f'<li>Данное место проведения будет занято '
                              f'<a href="/lessons/{has_lessons.id}" target="_blank">следующим занятием</a></li>')

        return {"status": "ok" if not warns and not errors else "error", "warnings": warns, "errors": errors}

    def validate_plan_rescheduling(self, params, *args, **kwargs):
        pass

    def get(self, request, *args, **kwargs):
        lesson_id = kwargs.get('pk')
        try:
            lesson = Lesson.objects.get(pk=lesson_id)
        except Lesson.DoesNotExist:
            return Response({"errors": "Занятие не найдено<br>Обновите страницу и повторите попытку"})
        # validation = self.validate_plan_rescheduling(request.query_params, *args, **kwargs)
        return Response(
            plan_rescheduling_info(
                datetime.strptime(request.query_params.get("date_start"), "%Y-%m-%d"),
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
            first_date=datetime.strptime(request.POST.get("date_start"), "%Y-%m-%d"),
            lessons=lessons,
            schedule=schedule
        )

        rescheduler.set_lessons_dt()
        return Response({'status': 'ok'}, status=status.HTTP_201_CREATED)

    def patch(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
        except Lesson.DoesNotExist:
            return Response({'errors': "Занятие не найдено<br>Обновите страницу и повторите попытку"},
                                status=status.HTTP_400_BAD_REQUEST)
        validation = self.validate_item_rescheduling(request, lesson, *args, **kwargs)
        if validation['status'] == "error":
            return Response(validation, status=status.HTTP_400_BAD_REQUEST)
        if request.data.get("action") == 'cancel':
            if request.data.get("date"):
                new_lesson = Lesson.objects.create(
                    name=lesson.name,
                    start_time=datetime.strptime(request.data.get("start"), "%H:%M").time(),
                    end_time=datetime.strptime(request.data.get("end"), "%H:%M").time(),
                    date=datetime.strptime(request.data.get("date"), "%Y-%m-%d"),
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
                return Response({'status': 'ok'}, status=status.HTTP_201_CREATED)
            else:
                pass
        else:
            if request.data.get("date"):
                lesson.start_time = datetime.strptime(request.data.get("start"), "%H:%M").time()
                lesson.end_time = datetime.strptime(request.data.get("end"), "%H:%M").time()
                lesson.date = datetime.strptime(request.data.get("date"), "%Y-%m-%d")
                lesson.save()
                return Response({'status': 'ok'}, status=status.HTTP_201_CREATED)
            pass
        return Response({'errors': 'Функция в разработке'}, status=status.HTTP_400_BAD_REQUEST)


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
            return Response({"status": "error"}, status=status.HTTP_400_BAD_REQUEST)
        if not lesson.from_program_lesson:
            return Response({"status": "error"}, status=status.HTTP_400_BAD_REQUEST)
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
        return Response(LessonSerializer(lesson).data, status=status.HTTP_200_OK)


class ScheduleAPIView(LoginRequiredMixin, APIView):
    monday: datetime
    sunday: datetime
    week_info: str

    def get_lessons(self, user_id: int, usergroups: list):
        q = None
        if "Listener" in usergroups:
            q = Lesson.objects.filter(learningphases__learningplan__listeners__id=user_id,
                                      date__gte=self.monday,
                                      date__lte=self.sunday)
        if "Teacher" in usergroups:
            q = Lesson.objects.filter(learningphases__learningplan__teacher__id=user_id,
                                      date__gte=self.monday,
                                      date__lte=self.sunday)
        return q

    def set_week_info(self):
        offset = int(self.request.query_params.get("offset")) if self.request.query_params.get("offset") else 0
        sel_date = datetime.today() + timedelta(days=offset * 7)
        self.monday = sel_date - timedelta(days=sel_date.weekday())
        self.sunday = self.monday + timedelta(days=6)
        self.week_info = f'{self.monday.strftime("%d.%m.%y")} - {self.sunday.strftime("%d.%m.%y")}'

    def get_schedule(self, lessons, usergroups: list):
        def get_lesson_info(l: Lesson):
            if l.start_time and l.end_time:
                l_time = f"{l.start_time.strftime('%H:%M')}-{l.end_time.strftime('%H:%M')}"
            else:
                l_time = "Без времени"
            if "Listener" in usergroups:
                teacher = lesson.get_teacher()
                participants = [f'{teacher.first_name} {teacher.last_name}']
            else:
                participants = [f'{u.first_name} {u.last_name}' for u in lesson.get_listeners()]
            return {
                "participants": participants,
                "time": l_time,
                "id": l.id,
                "status": l.status
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
