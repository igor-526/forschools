from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework.generics import ListCreateAPIView, ListAPIView
from .models import Lesson, Place
from dls.utils import get_menu


class LessonPage(LoginRequiredMixin, TemplateView):  # страница уроков
    template_name = "lessons.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Уроки', 'menu': get_menu(request.user)}
        return render(request, self.template_name, context)
