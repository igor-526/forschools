from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView
from .models import Material
from dls.utils import get_menu
from .utils.get_type import get_type
from dls.settings import MATERIAL_FORMATS
from .permissions import CanSeeMaterialMixin


class MaterialPage(LoginRequiredMixin, TemplateView):
    template_name = "materials_main.html"

    def get(self, request, *args, **kwargs):
        context = {
            'title': 'Материалы',
            'menu': get_menu(request.user),
            'material_formats': MATERIAL_FORMATS
        }
        return render(request, self.template_name, context)


class MaterialItemPage(CanSeeMaterialMixin, TemplateView):
    template_name = "materials_item/materials_item_main.html"

    def get(self, request, *args, **kwargs):
        material = Material.objects.get(pk=kwargs.get("pk"))
        material_type = get_type(material.file.name.split('.')[-1])
        can_edit = material.owner == request.user or request.user.has_perm('material.add_general')

        context = {'title': material.name,
                   'material': material,
                   'menu': get_menu(request.user),
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
