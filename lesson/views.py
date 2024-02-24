from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework.generics import ListCreateAPIView, ListAPIView
from .serializers import LessonSerializer, PlaceSerializer
from .models import Lesson, Place


class LessonPage(LoginRequiredMixin, TemplateView):  # страница уроков
    template_name = "lessons.html"

    def get(self, request, *args, **kwargs):
        data = Lesson.objects.all()
        context = {"lessons": data}
        return render(request, self.template_name, context)


class LessonListView(LoginRequiredMixin, ListCreateAPIView):    # API для вывода и добавления уроков
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer


class LessonPlaceView(LoginRequiredMixin, ListAPIView):  # API для вывода ссылок Zoom
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
