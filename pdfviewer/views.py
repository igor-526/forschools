from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import Http404
from django.shortcuts import render
from django.views.generic import TemplateView
from material.models import Material, File
from material.utils.get_type import get_type

from dls.utils import get_menu


class PDFPageView(LoginRequiredMixin, TemplateView):    # страница PDF
    template_name = "pdfviewer.html"

    def get(self, request, *args, **kwargs):
        if kwargs.get("where") == "material":
            material = Material.objects.filter(pk=kwargs.get("pk")).first()
            if not material:
                raise Http404
            if not get_type(material.file.path.split(".")[-1]) == "pdf_formats":
                raise Http404


        elif kwargs.get("where") == "file":
            pass
        else:
            raise Http404

        context = {'title': 'Дэшборд', 'menu': get_menu(request.user), 'file': material}
        return render(request, self.template_name, context)
