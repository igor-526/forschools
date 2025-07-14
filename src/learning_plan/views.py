from django.shortcuts import render
from django.views.generic import TemplateView

from .models import LearningPlan
from .permissions import (CanSeePlansPageMixin,
                          can_download_plan,
                          can_edit_plan,
                          can_generate_from_program,
                          get_can_edit_pre_hw_comment)


class PlansPageView(CanSeePlansPageMixin, TemplateView):
    template_name = 'plans_main.html'

    def get_teacher_set_permission(self):
        usergroups = [group.name for group in self.request.user.groups.all()]
        if ("Admin" in usergroups) or ("Metodist" in usergroups):
            return True
        return False

    def get(self, request, *args, **kwargs):
        context = {'title': 'Планы обучения',
                   'can_download': can_download_plan(request),
                   'can_set_teacher': self.get_teacher_set_permission()}
        return render(request, self.template_name, context)


class PlansItemPageView(CanSeePlansPageMixin, TemplateView):
    template_name = 'plans_item.html'

    def get(self, request, *args, **kwargs):
        plan = LearningPlan.objects.get(pk=kwargs.get("pk"))
        context = {
            'title': plan.name,
            'plan': plan,
            'can_edit_plan': can_edit_plan(request, plan),
            'can_generate_from_program':
                can_generate_from_program(request, plan),
            'can_edit_pre_hw_comment':
                get_can_edit_pre_hw_comment(request, plan)
        }
        return render(request, self.template_name, context)
