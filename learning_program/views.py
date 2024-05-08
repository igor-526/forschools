from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import LearningProgramHomework, LearningProgram, LearningProgramLesson, LearningProgramPhase
from .serializers import LearningProgramSerializer, LearningProgramHomeworkSerializer, LearningProgramLessonSerializer, LearningProgramPhaseSerializer
from dls.utils import get_menu


class LearningProgramsPageView(LoginRequiredMixin, TemplateView):
    template_name = 'learning_programs_main.html'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name, context={'menu': get_menu(request.user)})


class LearningProgramHomeworkListAPIView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = LearningProgramHomeworkSerializer
    model = LearningProgramHomework

    def get_queryset(self):
        return LearningProgramHomework.objects.filter(visibility=True)


class LearningProgramHomeworkDetailAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = LearningProgramHomeworkSerializer
    model = LearningProgramHomework

    def get_queryset(self):
        return LearningProgramHomework.objects.filter(visibility=True)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.visibility = False
        instance.save()
        return JsonResponse({'status': "success"}, status=status.HTTP_204_NO_CONTENT)


class LearningProgramLessonListAPIView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = LearningProgramLessonSerializer
    model = LearningProgramLesson

    def get_queryset(self):
        return LearningProgramLesson.objects.filter(visibility=True)


class LearningProgramLessonDetailAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = LearningProgramLessonSerializer
    model = LearningProgramLesson

    def get_queryset(self):
        return LearningProgramLesson.objects.filter(visibility=True)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.visibility = False
        instance.save()
        return JsonResponse({'status': "success"}, status=status.HTTP_204_NO_CONTENT)


class LearningProgramPhaseListAPIView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = LearningProgramPhaseSerializer
    model = LearningProgramPhase

    def get_queryset(self):
        return LearningProgramPhase.objects.filter(visibility=True)


class LearningProgramPhaseDetailAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = LearningProgramPhaseSerializer
    model = LearningProgramPhase

    def get_queryset(self):
        return LearningProgramPhase.objects.filter(visibility=True)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.visibility = False
        instance.save()
        return JsonResponse({'status': "success"}, status=status.HTTP_204_NO_CONTENT)


class LearningProgramListAPIView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = LearningProgramSerializer
    model = LearningProgram

    def get_queryset(self):
        return LearningProgram.objects.filter(visibility=True)


class LearningProgramDetailAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = LearningProgramSerializer
    model = LearningProgram

    def get_queryset(self):
        return LearningProgram.objects.filter(visibility=True)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.visibility = False
        instance.save()
        return JsonResponse({'status': "success"}, status=status.HTTP_204_NO_CONTENT)
