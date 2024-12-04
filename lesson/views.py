from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework import status
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.generics import ListCreateAPIView, ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from learning_plan.permissions import plans_button
from learning_plan.utils import Rescheduling, get_schedule, plan_rescheduling_info
from material.models import Material
from tgbot.utils import send_homework_tg, send_materials
from .models import Lesson, Place
from dls.utils import get_menu
from dls.settings import MATERIAL_FORMATS
from .serializers import LessonListSerializer, LessonSerializer
from .permissions import (CanReplaceTeacherMixin, CanSeeLessonMixin,
                          replace_teacher_button, can_edit_lesson_materials,
                          can_see_lesson_materials, can_add_homework, can_set_passed, can_set_not_held)
from datetime import datetime, timedelta, date


class LessonPage(LoginRequiredMixin, TemplateView):
    template_name = "lessons.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Занятия',
                   'menu': get_menu(request.user),
                   'plans_button': plans_button(request)}
        return render(request, self.template_name, context)


class LessonItemPage(CanSeeLessonMixin, TemplateView):
    template_name = "lesson_item.html"

    def get(self, request, *args, **kwargs):
        lesson = Lesson.objects.get(pk=kwargs.get("pk"))
        can_add_hw = can_add_homework(request, lesson)
        hw_curator_button = (lesson.get_learning_plan().teacher == request.user or
                             lesson.replace_teacher == request.user or
                             lesson.get_learning_plan().metodist == request.user or
                             request.user.groups.filter(name="Admin").exists())
        context = {
            'title': lesson.name,
            'menu': get_menu(request.user),
            'lesson': lesson,
            'can_set_replace': replace_teacher_button(request),
            'can_see_materials': can_see_lesson_materials(request, lesson),
            'can_edit_materials': can_edit_lesson_materials(request, lesson),
            'can_add_hw': can_add_hw,
            'can_set_passed': can_set_passed(request, lesson),
            'hw_curator_button': hw_curator_button,
            'material_formats': MATERIAL_FORMATS
        }
        if can_add_hw:
            hwdeadline = (lesson.get_hw_deadline())
            if hwdeadline:
                hwdeadline = hwdeadline.strftime('%Y-%m-%d')
            context["hwdeadline"] = hwdeadline
        return render(request, self.template_name, context)


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

    def filter_status(self, queryset):
        lesson_status = self.request.query_params.get("status")
        if lesson_status:
            queryset = queryset.filter(status=lesson_status)
        return queryset

    def filter_date_start(self, queryset):
        ds = self.request.query_params.get("date_start")
        if ds:
            ds = datetime.strptime(ds, "%Y-%m-%d")
            queryset = queryset.filter(date__gte=ds)
        else:
            queryset = queryset.filter(date__gte=date.today() - timedelta(days=2))
        return queryset

    def filter_date_end(self, queryset):
        de = self.request.query_params.get("date_end")
        if de:
            ds = datetime.strptime(de, "%Y-%m-%d")
            queryset = queryset.filter(date__lte=ds)
        else:
            queryset = queryset.filter(date__lte=date.today() + timedelta(days=6))
        return queryset

    def filter_teachers(self, queryset):
        teachers = self.request.query_params.getlist("teacher")
        if teachers:
            queryset = queryset.filter(
                Q(learningphases__learningplan__teacher_id__in=teachers) |
                Q(replace_teacher_id__in=teachers)
            )
        return queryset

    def filter_listeners(self, queryset):
        listeners = self.request.query_params.getlist("listener")
        if listeners:
            queryset = queryset.filter(learningphases__learningplan__listeners__in=listeners)
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
                                                 Q(id__in=[l.id for l in queryset]))
            else:
                queryset = Lesson.objects.filter(learningphases__learningplan__curators=self.request.user)
        queryset = self.filter_status(queryset)
        queryset = self.filter_date_start(queryset)
        queryset = self.filter_date_end(queryset)
        queryset = self.filter_teachers(queryset)
        queryset = self.filter_listeners(queryset)
        return queryset.distinct()[:50]


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
        return JsonResponse({'status': 'ok'})

    def delete(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
            materials = request.data.get('materials')
            lesson.materials.remove(*materials)
            lesson.save()
            return JsonResponse({'status': 'ok'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LessonReplaceTeacherAPIView(CanReplaceTeacherMixin, APIView):
    def patch(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
            lesson.replace_teacher_id = request.data.get('teacher_id')
            lesson.save()
            return JsonResponse({'status': 'ok'}, status=status.HTTP_200_OK)
        except Lesson.DoesNotExist:
            return JsonResponse({'error': 'Занятие не найдено'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LessonSetPassedAPIView(LoginRequiredMixin, APIView):
    def post(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
        except Lesson.DoesNotExist:
            return JsonResponse({'error': "Занятие не найдено"}, status=status.HTTP_400_BAD_REQUEST)
        if lesson.status == 0:
            if can_set_passed(request, lesson):
                lesson_name = request.POST.get('lesson_name').strip(" ")
                if len(lesson_name) > 200:
                    return JsonResponse({'lesson_name': "Длина наименования занятия не "
                                                        "может превышать 200 символов"},
                                        status=status.HTTP_400_BAD_REQUEST)
                if lesson_name != '':
                    lesson.name = lesson_name
                lesson.status = 1
                lesson.save()
                for listener in lesson.get_learning_plan().listeners.all():
                    homeworks = lesson.homeworks.filter(listener=listener)
                    for hw in homeworks:
                        res = hw.set_assigned()
                        if res.get("agreement") is not None and res.get("agreement") == False:
                            send_homework_tg(request.user, listener, [hw])
                        else:
                            send_homework_tg(initiator=hw.teacher,
                                             listener=hw.get_lesson().get_learning_plan().metodist,
                                             homeworks=[hw],
                                             text="Требуется согласование действия преподавталя")
                return JsonResponse({'status': 'ok'}, status=status.HTTP_201_CREATED)
            else:
                return JsonResponse({'error': "Недостаточно прав для изменения статуса занятия"},
                                    status=status.HTTP_400_BAD_REQUEST)
        else:
            return JsonResponse({'error': "Занятие уже проведено"}, status=status.HTTP_400_BAD_REQUEST)


class LessonSetNotHeldAPIView(LoginRequiredMixin, APIView):
    def post(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
        except Lesson.DoesNotExist:
            return JsonResponse({'error': "Занятие не найдено"}, status=status.HTTP_400_BAD_REQUEST)
        if lesson.status != 0:
            if can_set_not_held(request, lesson):
                lesson.status = 0
                lesson.save()
                serialized_lesson = LessonSerializer(lesson, context={'request': request})
                return Response(serialized_lesson.data, status=status.HTTP_201_CREATED)
            else:
                return JsonResponse({'error': "Недостаточно прав для изменения статуса занятия"},
                                    status=status.HTTP_400_BAD_REQUEST)
        else:
            return JsonResponse({'error': "Занятие в статусе непроведённого"}, status=status.HTTP_400_BAD_REQUEST)


class UserLessonListAPIView(LoginRequiredMixin, ListAPIView):
    serializer_class = LessonListSerializer

    def get_queryset(self, *args, **kwargs):
        userID = self.kwargs.get('pk')
        return Lesson.objects.filter(learningphases__learningplan__listeners__id=userID)


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
        print(params)

    def get(self, request, *args, **kwargs):
        lesson_id = kwargs.get('pk')
        try:
            lesson = Lesson.objects.get(pk=lesson_id)
        except Lesson.DoesNotExist:
            return JsonResponse({"errors": "Занятие не найдено<br>Обновите страницу и повторите попытку"})
        validation = self.validate_plan_rescheduling(request.query_params, *args, **kwargs)
        return JsonResponse(
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
        return JsonResponse({'status': 'ok'}, status=status.HTTP_201_CREATED)

    def patch(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
        except Lesson.DoesNotExist:
            return JsonResponse({'errors': "Занятие не найдено<br>Обновите страницу и повторите попытку"},
                                status=status.HTTP_400_BAD_REQUEST)
        validation = self.validate_item_rescheduling(request, lesson, *args, **kwargs)
        if validation['status'] == "error":
            return JsonResponse(validation, status=status.HTTP_400_BAD_REQUEST)
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
                return JsonResponse({'status': 'ok'}, status=status.HTTP_201_CREATED)
            else:
                pass
        else:
            if request.data.get("date"):
                lesson.start_time = datetime.strptime(request.data.get("start"), "%H:%M").time()
                lesson.end_time = datetime.strptime(request.data.get("end"), "%H:%M").time()
                lesson.date = datetime.strptime(request.data.get("date"), "%Y-%m-%d")
                lesson.save()
                return JsonResponse({'status': 'ok'}, status=status.HTTP_201_CREATED)
            pass
        return JsonResponse({'errors': 'Функция в разработке'}, status=status.HTTP_400_BAD_REQUEST)


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
            return JsonResponse({"status": "error"}, status=status.HTTP_400_BAD_REQUEST)
        if not lesson.from_program_lesson:
            return JsonResponse({"status": "error"}, status=status.HTTP_400_BAD_REQUEST)
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
        return JsonResponse(LessonSerializer(lesson).data, status=status.HTTP_200_OK)
