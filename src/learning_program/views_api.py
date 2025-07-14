from django.contrib.auth.mixins import LoginRequiredMixin

from rest_framework import status
from rest_framework.generics import (ListCreateAPIView,
                                     RetrieveUpdateDestroyAPIView)
from rest_framework.response import Response

from .models import (LearningProgram,
                     LearningProgramHomework,
                     LearningProgramLesson,
                     LearningProgramPhase)
from .serializers import (LearningProgramHomeworkSerializer,
                          LearningProgramLessonSerializer,
                          LearningProgramPhaseSerializer,
                          LearningProgramSerializer)


class LearningProgramHomeworkListAPIView(LoginRequiredMixin,
                                         ListCreateAPIView):
    serializer_class = LearningProgramHomeworkSerializer
    model = LearningProgramHomework

    def get_queryset(self):
        return LearningProgramHomework.objects.filter(visibility=True)


class LearningProgramHomeworkDetailAPIView(LoginRequiredMixin,
                                           RetrieveUpdateDestroyAPIView):
    serializer_class = LearningProgramHomeworkSerializer
    model = LearningProgramHomework

    def get_queryset(self):
        return LearningProgramHomework.objects.filter(visibility=True)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.visibility = False
        instance.save()
        return Response(data={'status': "success"},
                        status=status.HTTP_204_NO_CONTENT)


class LearningProgramLessonListAPIView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = LearningProgramLessonSerializer
    model = LearningProgramLesson

    def filter_queryset(self, queryset):
        phases = self.request.query_params.getlist('phase')
        if phases:
            queryset = queryset.filter(learningprogramphase__in=phases)
        return queryset.distinct()

    def get_queryset(self):
        return self.filter_queryset(
            LearningProgramLesson.objects.filter(visibility=True)
        )


class LearningProgramLessonDetailAPIView(LoginRequiredMixin,
                                         RetrieveUpdateDestroyAPIView):
    serializer_class = LearningProgramLessonSerializer
    model = LearningProgramLesson

    def get_queryset(self):
        return LearningProgramLesson.objects.filter(visibility=True)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.visibility = False
        instance.save()
        return Response(data={'status': "success"},
                        status=status.HTTP_204_NO_CONTENT)


class LearningProgramPhaseListAPIView(LoginRequiredMixin,
                                      ListCreateAPIView):
    serializer_class = LearningProgramPhaseSerializer
    model = LearningProgramPhase

    def filter_queryset(self, queryset):
        progs = self.request.query_params.getlist('prog')
        if progs:
            queryset = queryset.filter(learningprogram__in=progs)
        return queryset.distinct()

    def get_queryset(self):
        return self.filter_queryset(LearningProgramPhase.objects.filter(
            visibility=True
        ))


class LearningProgramPhaseDetailAPIView(LoginRequiredMixin,
                                        RetrieveUpdateDestroyAPIView):
    serializer_class = LearningProgramPhaseSerializer
    model = LearningProgramPhase

    def get_queryset(self):
        return LearningProgramPhase.objects.filter(visibility=True)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.visibility = False
        instance.save()
        return Response(data={'status': "success"},
                        status=status.HTTP_204_NO_CONTENT)


class LearningProgramListAPIView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = LearningProgramSerializer
    model = LearningProgram

    def get_queryset(self):
        return LearningProgram.objects.filter(visibility=True)


class LearningProgramDetailAPIView(LoginRequiredMixin,
                                   RetrieveUpdateDestroyAPIView):
    serializer_class = LearningProgramSerializer
    model = LearningProgram

    def get_queryset(self):
        return LearningProgram.objects.filter(visibility=True)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.visibility = False
        instance.save()
        return Response(data={'status': "success"},
                        status=status.HTTP_204_NO_CONTENT)
