from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView
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
        return LearningProgramHomework.objects.all()


class LearningProgramHomeworkDetailAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = LearningProgramHomeworkSerializer
    model = LearningProgramHomework

    def get_queryset(self):
        return LearningProgramHomework.objects.all()


class LearningProgramLessonListAPIView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = LearningProgramLessonSerializer
    model = LearningProgramLesson

    def get_queryset(self):
        return LearningProgramLesson.objects.all()


class LearningProgramLessonDetailAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = LearningProgramLessonSerializer
    model = LearningProgramLesson

    def get_queryset(self):
        return LearningProgramLesson.objects.all()


class LearningProgramPhaseListAPIView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = LearningProgramPhaseSerializer
    model = LearningProgramPhase

    def get_queryset(self):
        return LearningProgramPhase.objects.all()


class LearningProgramPhaseDetailAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = LearningProgramPhaseSerializer
    model = LearningProgramPhase

    def get_queryset(self):
        return LearningProgramPhase.objects.all()


class LearningProgramListAPIView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = LearningProgramSerializer
    model = LearningProgram

    def get_queryset(self):
        return LearningProgram.objects.all()


class LearningProgramDetailAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = LearningProgramSerializer
    model = LearningProgram

    def get_queryset(self):
        return LearningProgram.objects.all()
