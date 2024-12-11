from django.shortcuts import render
from django.views.generic import TemplateView
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache

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
        context = {
            "title": "Занятие",
            "lesson_id": kwargs.get("pk"),
            "is_authenticated": request.user.is_authenticated,
        }
        return render(request, self.template_name, context)
