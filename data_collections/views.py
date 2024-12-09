from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView
from dls.utils import get_menu


class CollectionPageView(LoginRequiredMixin, TemplateView):
    template_name = "collections_main.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Коллекции данных', 'menu': get_menu(request.user)}
        return render(request, self.template_name, context)
