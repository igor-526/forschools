from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView

from dls.settings import MATERIAL_FORMATS


class LearningProgramsPageView(LoginRequiredMixin, TemplateView):
    template_name = 'learning_programs_main.html'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name, context={
            'material_formats': MATERIAL_FORMATS
        })
