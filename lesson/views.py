from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework import status
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.generics import ListCreateAPIView, ListAPIView
from rest_framework.views import APIView
from learning_plan.permissions import plans_button
from .models import Lesson
from dls.utils import get_menu
from .serializers import LessonListSerializer
from .permissions import (CanReplaceTeacherMixin, CanSeeLessonMixin,
                          replace_teacher_button, can_edit_lesson_materials,
                          can_see_lesson_materials, can_add_homework)


class LessonPage(LoginRequiredMixin, TemplateView):  # страница уроков
    template_name = "lessons.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Уроки',
                   'menu': get_menu(request.user),
                   'plans_button': plans_button(request),}
        return render(request, self.template_name, context)


class LessonItemPage(CanSeeLessonMixin, TemplateView):  # страница урока
    template_name = "lesson_item.html"

    def get(self, request, *args, **kwargs):
        lesson = Lesson.objects.get(pk=kwargs.get("pk"))
        context = {'title': lesson.name,
                   'menu': get_menu(request.user),
                   'lesson': lesson,
                   'can_set_replace': replace_teacher_button(request),
                   'can_see_materials': can_see_lesson_materials(request, lesson),
                   'can_edit_materials': can_edit_lesson_materials(request, lesson),
                   'can_add_hw': can_add_homework(request, lesson)
                   }
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
        if kwargs.get("group") == 'Teacher':
            queryset = queryset.filter(Q(learningphases__learningplan__teacher=kwargs.get("user")) |
                                       Q(replace_teacher=kwargs.get("user")))
        elif kwargs.get("group") == 'Listener':
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


class LessonAddMaterials(LoginRequiredMixin, APIView):
    def post(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
            for material in request.POST.getlist('material'):
                lesson.materials.add(material)
            lesson.save()
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return JsonResponse({'status': 'ok'})


class LessonReplaceTeacher(CanReplaceTeacherMixin, APIView):
    def patch(self, request, *args, **kwargs):
        try:
            lesson = Lesson.objects.get(pk=kwargs.get("pk"))
            lesson.replace_teacher_id = request.data.get('teacher_id')
            lesson.save()
            return JsonResponse({'status': 'ok'}, status=status.HTTP_200_OK)
        except Lesson.DoesNotExist:
            return JsonResponse({'error': 'Урок не найден'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
