from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView
from django.shortcuts import render
from dls.settings import MATERIAL_FORMATS
from .models import Homework
from .permissions import (get_send_hw_permission,
                          get_can_check_hw_permission,
                          get_can_cancel_hw_permission,
                          get_can_edit_hw_permission)
from .utils import get_homework_list_settings


class HomeworksListPage(LoginRequiredMixin, TemplateView):
    def get_template_names(self):
        if self.request.user_agent.is_mobile:
            return 'mobile/homeworks_list.html'
        return 'homeworks_list.html'

    def get(self, request, *args, **kwargs):
        user_groups = [group.name for group in request.user.groups.all()]
        settings = get_homework_list_settings(user_groups)
        context = {
            'title': 'Домашние задания',
            'can_add_hw': True,
            "tabs": settings["tabs"],
            "settings": settings["settings"],
            'material_formats': MATERIAL_FORMATS
        }
        if self.request.user_agent.is_mobile:
            context['menu_m'] = "hw"
        return render(request, self.get_template_names(), context)


class HomeworkItemPage(LoginRequiredMixin, TemplateView):
    template_name = "homework_item.html"

    def get(self, request, *args, **kwargs):
        hw = Homework.objects.get(pk=kwargs.get('pk'))
        hw_status = hw.get_status().status
        if hw_status == 1 and hw.listener == request.user:
            hw.open()
        context = {'title': hw.name,
                   "hw": hw}
        return render(request, self.template_name, context)
