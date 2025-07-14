from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView

from dls.settings import MATERIAL_FORMATS

from .models import Material
from .permissions import CanSeeMaterialMixin
from .utils import get_type_by_ext


class MaterialPage(LoginRequiredMixin, TemplateView):
    template_name = "materials_main.html"

    def get(self, request, *args, **kwargs):
        context = {
            'title': 'Материалы',
            'material_formats': MATERIAL_FORMATS
        }
        return render(request, self.template_name, context)


class MaterialItemPage(CanSeeMaterialMixin, TemplateView):
    template_name = "materials_item/materials_item_main.html"

    def get(self, request, *args, **kwargs):
        material = Material.objects.get(pk=kwargs.get("pk"))
        material_type = get_type_by_ext(material.file.name.split('.')[-1])
        can_edit = (material.owner == request.user or
                    request.user.has_perm('material.add_general'))

        context = {'title': material.name,
                   'material': material,
                   'material_type': material_type,
                   'can_edit': can_edit,
                   'material_formats': MATERIAL_FORMATS}
        if material_type == "text_formats":
            try:
                with open(material.file.path, "r", encoding="utf-16") as f:
                    context['text'] = f.readlines()

            except (UnicodeDecodeError, UnicodeError):
                with open(material.file.path, "r", encoding="utf-8") as f:
                    context['text'] = f.readlines()
        return render(request, self.template_name, context)
