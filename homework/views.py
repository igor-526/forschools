from lesson.permissions import replace_teacher_button
from .models import Homework
from .permissions import get_send_hw_permission, get_can_check_hw_permission, get_can_cancel_hw_permission
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView
from dls.settings import MATERIAL_FORMATS
from django.shortcuts import render
from dls.utils import get_menu


class HomeworksPage(LoginRequiredMixin, TemplateView):
    template_name = "homeworks.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Домашние задания',
                   'menu': get_menu(request.user),
                   'can_add_hw': True,
                   'is_admin_or_metodist': request.user.groups.filter(name__in=["Admin", "Metodist"]).exists(),
                   'is_teacher': request.user.groups.filter(name="Teacher").exists(),
                   'is_listener': request.user.groups.filter(name="Listener").exists(),
                   'material_formats': MATERIAL_FORMATS}
        return render(request, self.template_name, context)


class HomeworkItemPage(LoginRequiredMixin, TemplateView):
    template_name = "homework_item.html"

    def get(self, request, *args, **kwargs):
        hw = Homework.objects.get(pk=kwargs.get('pk'))
        hw_status = hw.get_status().status
        if hw_status == 1 and hw.listener == request.user:
            hw.open()
        context = {'title': hw.name,
                   'menu': get_menu(request.user),
                   "hw": hw,
                   "can_send": get_send_hw_permission(hw, request),
                   "can_check": get_can_check_hw_permission(hw, request),
                   "can_cancel": get_can_cancel_hw_permission(hw, request),
                   "can_set_replace": replace_teacher_button(request)}
        return render(request, self.template_name, context)
