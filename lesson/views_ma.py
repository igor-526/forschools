from django.shortcuts import render
from django.views.generic import TemplateView


class LessonMAReviewFormPage(TemplateView):
    template_name = "ma/lesson_review_form.html"

    def get(self, request, *args, **kwargs):
        context = {
            "title": "Провести занятие",
            "lesson_id": kwargs.get("pk"),
            "is_authenticated": request.user.is_authenticated,
        }
        return render(request, self.template_name, context)
