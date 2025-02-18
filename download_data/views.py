from django.shortcuts import render
from django.views.generic import TemplateView
from dls.utils import get_menu
from download_data.permissions import CanSeeGeneratedData


class GeneratedPage(CanSeeGeneratedData, TemplateView):
    template_name = "generated_main.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Выгрузка данных',
                   'menu': get_menu(request.user)}
        return render(request, self.template_name, context)
