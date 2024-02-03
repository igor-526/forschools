from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic import TemplateView
from .models import Lesson
from .forms import LessonForm


class LessonPage(LoginRequiredMixin, TemplateView):  # страница уроков
    template_name = "lessons.html"

    def get(self, request, *args, **kwargs):
        data = Lesson.objects.all()
        context = {"lessons": data}
        return render(request, self.template_name, context)


class LessonAddPage(LoginRequiredMixin, TemplateView):  # страница добавления урока
    template_name = "lessons_add.html"

    def get(self, request, *args, **kwargs):
        form = LessonForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request, *args, **kwargs):
        form = LessonForm(request.POST)
        if form.is_valid():
            lesson = form.save()
            lesson.materials.set(request.POST.getlist('materials'))
            return HttpResponseRedirect(reverse_lazy('lessons'))
        else:
            return HttpResponse(form.errors)
