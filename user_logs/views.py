from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView
from dls.utils import get_menu


class UserLogsPageTemplateView(LoginRequiredMixin, TemplateView):
    template_name = "user_logs.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Логи плана обучения',
                   'menu': get_menu(request.user)}
        return render(request, self.template_name, context)
