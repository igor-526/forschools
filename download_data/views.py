from django.shortcuts import render
from django.views.generic import TemplateView
from download_data.permissions import CanSeeGeneratedData


class GeneratedPage(CanSeeGeneratedData, TemplateView):
    template_name = "generated_main.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Выгрузка данных'}
        return render(request, self.template_name, context)
