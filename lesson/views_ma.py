from django.shortcuts import render
from django.views.generic import TemplateView
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from lesson.models import Lesson
from lesson.permissions import can_set_passed

decorators = [never_cache]


@method_decorator(decorators, name='dispatch')
class LessonMAReviewFormPage(TemplateView):
    template_name = "ma/lesson_review_form.html"

    def get(self, request, *args, **kwargs):
        context = {
            "title": "Провести занятие",
            "lesson_id": kwargs.get("pk"),
            "is_authenticated": request.user.is_authenticated,
        }
        return render(request, self.template_name, context)


@method_decorator(decorators, name='dispatch')
class LessonItemMAPage(TemplateView):
    template_name = "ma/lesson_item.html"

    def get(self, request, *args, **kwargs):
        lesson = Lesson.objects.get(pk=kwargs.get("pk"))
        context = {
            "title": "Занятие",
            "lesson_id": kwargs.get("pk"),
            "is_authenticated": request.user.is_authenticated,
            'can_set_passed': can_set_passed(request, lesson),
        }
        return render(request, self.template_name, context)


@method_decorator(decorators, name='dispatch')
class ScheduleSelectMAPage(TemplateView):
    template_name = "ma/schedule_select.html"

    def get(self, request, *args, **kwargs):
        context = {
            "title": "Пользователь",
            "is_authenticated": request.user.is_authenticated,
            "me": request.user.groups.filter(
                name__in=["Teacher", "Listener"]
            ).exists()
        }
        return render(request, self.template_name, context)


@method_decorator(decorators, name='dispatch')
class ScheduleMAPage(TemplateView):
    template_name = "ma/schedule.html"

    def get(self, request, *args, **kwargs):
        context = {
            "title": "Расписание",
            "is_authenticated": request.user.is_authenticated,
            "user_id": kwargs.get("pk")
        }
        return render(request, self.template_name, context)
