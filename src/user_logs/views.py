from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView


class UserLogsPageTemplateView(LoginRequiredMixin, TemplateView):
    template_name = "user_logs.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Логи пользователей'}
        return render(request, self.template_name, context)
