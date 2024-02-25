from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView
from dls.utils import get_menu


class HomeworkPage(LoginRequiredMixin, TemplateView):  # страница домашних заданий
    template_name = "homeworks.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Домашние задания', 'menu': get_menu(request.user)}
        return render(request, self.template_name, context)

