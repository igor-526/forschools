from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache


decorators = [never_cache]


@method_decorator(decorators, name='dispatch')
class HomeworkItemMAPage(LoginRequiredMixin, TemplateView):
    template_name = "ma/homework_item.html"

    def get(self, request, *args, **kwargs):
        context = {
            "title": "Домашнее задание",
            "homework_id": kwargs.get("pk"),
            "is_authenticated": request.user.is_authenticated,
        }
        return render(request, self.template_name, context)