from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView


class CollectionPageView(LoginRequiredMixin, TemplateView):
    template_name = "collections_main.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Коллекции данных'}
        return render(request, self.template_name, context)
