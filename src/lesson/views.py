from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView

from dls.settings import MATERIAL_FORMATS

from learning_plan.permissions import get_can_see_plan

from .models import Lesson
from .permissions import (CanSeeLessonMixin,
                          can_edit_lesson_materials,
                          can_see_lesson_materials,
                          can_set_passed)


class LessonsListPage(LoginRequiredMixin, TemplateView):
    def get_template_names(self):
        if self.request.user_agent.is_mobile:
            return 'mobile/lessons_list.html'
        return 'lessons_list.html'

    def get(self, request, *args, **kwargs):
        context = {
            'title': 'Занятия',
        }
        if self.request.user_agent.is_mobile:
            context['menu_m'] = 'lesson'
        return render(request, self.get_template_names(), context)


class LessonItemPage(CanSeeLessonMixin, TemplateView):
    template_name = 'lesson_item.html'

    def get(self, request, *args, **kwargs):
        lesson = Lesson.objects.get(pk=kwargs.get("pk"))
        can_add_hw = True
        hw_curator_button = (
                lesson.get_learning_plan().teacher == request.user or
                lesson.replace_teacher == request.user or
                lesson.get_learning_plan().metodist == request.user or
                request.user.groups.filter(name="Admin").exists()
        )
        plan_button = None
        lp = lesson.get_learning_plan()
        if get_can_see_plan(request, lp, lesson):
            plan_button = lp.id
        context = {
            'lesson': lesson,
            'can_set_replace': False,
            'can_see_materials': can_see_lesson_materials(request, lesson),
            'can_edit_materials': can_edit_lesson_materials(request, lesson),
            'can_add_hw': can_add_hw,
            'can_set_passed': can_set_passed(request, lesson),
            'hw_curator_button': hw_curator_button,
            'material_formats': MATERIAL_FORMATS,
            'plan_button': plan_button
        }
        if can_add_hw:
            hwdeadline = (lesson.get_hw_deadline())
            if hwdeadline:
                hwdeadline = hwdeadline.strftime('%Y-%m-%d')
            context["hwdeadline"] = hwdeadline
        return render(request, self.template_name, context)
