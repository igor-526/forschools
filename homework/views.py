from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic import TemplateView
from .models import Homework
from .forms import HomeworkForm


class HomeworkPage(LoginRequiredMixin, TemplateView):  # страница домашних заданий
    template_name = "homeworks.html"

    def get(self, request, *args, **kwargs):
        data = Homework.objects.all()
        context = {"homeworks": data}
        return render(request, self.template_name, context)


class HomeworkAddPage(LoginRequiredMixin, TemplateView):  # страница добавления ДЗ
    template_name = "homeworks_add.html"

    def get(self, request, *args, **kwargs):
        form = HomeworkForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request, *args, **kwargs):
        form = HomeworkForm(request.POST)
        if form.is_valid():
            homework = form.save()
            homework.materials.set(request.POST.getlist('materials'))
            return HttpResponseRedirect(reverse_lazy('homeworks'))
        else:
            return HttpResponse(form.errors)
