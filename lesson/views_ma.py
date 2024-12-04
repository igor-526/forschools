from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView


class LessonMAReviewFormPage(LoginRequiredMixin, TemplateView):
    template_name = "ma/lesson_review_form.html"

    def get(self, request, *args, **kwargs):
        context = {}
        return render(request, self.template_name, context)
