from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic import TemplateView
from .models import Homework
from .forms import HomeworkForm
from .utils import telegram
from dls.utils import get_tg_id
from tgbot.keyboards.show_keyboard import get_show_keys_hw_l


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
            tg_id = get_tg_id(homework.listener)
            if tg_id:
                telegram.send_homework(tg_id=tg_id,
                                       text="У Вас новое домашнее задание!",
                                       keys=get_show_keys_hw_l(homework.id, 1))
            return HttpResponseRedirect(reverse_lazy('homeworks'))
        else:
            return HttpResponse(form.errors)
