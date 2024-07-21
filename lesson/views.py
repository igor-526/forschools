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
from tgbot.utils import send_homework_tg
from .models import Lesson, Place
from dls.utils import get_menu
from dls.settings import MATERIAL_FORMATS
from .serializers import LessonListSerializer, LessonSerializer
from .permissions import (CanReplaceTeacherMixin, CanSeeLessonMixin,
                          replace_teacher_button, can_edit_lesson_materials,
                          can_see_lesson_materials, can_add_homework, can_set_passed, can_set_not_held)
from datetime import datetime


class LessonPage(LoginRequiredMixin, TemplateView):  # страница занятий
    template_name = "lessons.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Занятия',
                   'menu': get_menu(request.user),
                   'plans_button': plans_button(request)}
        return render(request, self.template_name, context)


class LessonItemPage(CanSeeLessonMixin, TemplateView):  # страница занятия
    template_name = "lesson_item.html"

    def get(self, request, *args, **kwargs):
        lesson = Lesson.objects.get(pk=kwargs.get("pk"))
        can_add_hw = can_add_homework(request, lesson)
        context = {
            'title': lesson.name,
            'menu': get_menu(request.user),
            'lesson': lesson,
            'can_set_replace': replace_teacher_button(request),
            'can_see_materials': can_see_lesson_materials(request, lesson),
            'can_edit_materials': can_edit_lesson_materials(request, lesson),
            'can_add_hw': can_add_hw,
            'can_set_passed': can_set_passed(request, lesson),
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

    def get_queryset(self, *args, **kwargs):
        queryset = Lesson.objects.filter(status=kwargs.get("status"))
        if kwargs.get("groups") == 'Teacher':
            queryset = queryset.filter(Q(learningphases__learningplan__teacher=kwargs.get("user")) |
                                       Q(replace_teacher=kwargs.get("user")))
        elif kwargs.get("groups") == 'Listener':
            queryset = queryset.filter(learningphases__learningplan__listeners=kwargs.get("user"),
                                       date__isnull=False)
        return queryset

    def list(self, request, *args, **kwargs):
        group = request.user.groups.first().name
        queryset = self.get_queryset(status=request.query_params.get('status'),
                                     group=group,
                                     user=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False)


class LessonAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer


class LessonSetMaterialsAPIView(LoginRequiredMixin, APIView):
    def post(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
            lesson.materials.set(request.data.get('materials'))
            lesson.save()
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
                note_teacher = request.POST.get('note_teacher').strip("")
                if len(note_teacher) > 2000:
                    return JsonResponse({'error': "Длина заметки не может превышать 2000 символов"},
                                        status=status.HTTP_400_BAD_REQUEST)
                if note_teacher != '':
                    lesson.note_teacher = note_teacher
                lesson.status = 1
                lesson.save()
                for listener in lesson.get_learning_plan().listeners.all():
                    homeworks = lesson.homeworks.filter(listener=listener)
                    send_homework_tg(listener, homeworks)
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
        else:
            req_date = datetime.strptime(req_date, "%Y-%m-%d")
            today = datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)
            if req_date < today:
                errors += "<li>Дата занятия не может быть раньше, чем сегодня</li>"
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
        self.validate_plan_rescheduling(request.query_params, *args, **kwargs)
        return JsonResponse({"errors": "test", "warnings": "test"}, status=status.HTTP_400_BAD_REQUEST)
        # return JsonResponse(
        #     plan_rescheduling_info(
        #         datetime.strptime(request.query_params.get("date_start"), "%Y-%m-%d"),
        #         get_schedule(request.query_params),
        #         lesson
        #     ), status=status.HTTP_200_OK)

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
            return JsonResponse({'errors': "Занятие не найдено<br>Обновите страницу и повторите попытку"}, status=status.HTTP_400_BAD_REQUEST)
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
