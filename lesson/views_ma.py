from django.shortcuts import render
from django.views.generic import TemplateView
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache

decorators = [never_cache]


@method_decorator(decorators, name='dispatch')
class ScheduleSelectMAPage(TemplateView):
    template_name = "ma/schedule_select.html"

    def get(self, request, *args, **kwargs):
        context = {
            "title": "Пользователь",
            "is_authenticated": request.user.is_authenticated,
            "me": request.user.groups.filter(name__in=["Teacher", "Listener"]).exists()
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
        