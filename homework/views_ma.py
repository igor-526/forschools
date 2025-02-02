from django.views.generic import TemplateView
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache


decorators = [never_cache]


@method_decorator(decorators, name='dispatch')
class HomeworkItemMAPage(TemplateView):
    template_name = "ma/homework_item.html"

    def get(self, request, *args, **kwargs):
        context = {
            "title": "Домашнее задание",
            "homework_id": kwargs.get("pk"),
            "homework_info": request.user.groups.filter(
                name__in=["Admin", "Metodist", "Teacher", "Curator"]).exists(),
            "is_authenticated": request.user.is_authenticated,
        }
        return render(request, self.template_name, context)
