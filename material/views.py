from json import dumps
from pdf2image import convert_from_path
import os
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import Material, MaterialCategory
from rest_framework.generics import ListCreateAPIView, ListAPIView, RetrieveUpdateDestroyAPIView
from .serializers import MaterialSerializer, MaterialCategorySerializer
from dls.utils import get_menu
from .utils.get_type import get_type


class MaterialPage(LoginRequiredMixin, TemplateView):    # страница матриалов
    template_name = "materials_main.html"

    def get(self, request, *args, **kwargs):
        perms = request.user.get_group_permissions()
        filtered_perms = [perm for perm in perms if "material." in perm]
        context = {'title': 'Материалы',
                   'menu': get_menu(request.user),
                   'userperms': dumps(filtered_perms)}
        return render(request, self.template_name, context)


class MaterialListView(LoginRequiredMixin, ListCreateAPIView):  # API для просмотра и добавления материалов
    queryset = Material.objects.filter(visible=True)
    serializer_class = MaterialSerializer

    def get_queryset(self):
        param_type = self.request.query_params.get('type')
        if not param_type or param_type == '2':
            if self.request.user.has_perm('material.see_all_general'):
                return Material.objects.filter(type=2, visible=True)
            else:
                raise PermissionDenied
        elif param_type == "1":
            return Material.objects.filter(type=1, owner=self.request.user, visible=True)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class MaterialAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

    def delete(self, request, *args, **kwargs):
        print("slkfv")
        material = self.get_object()
        material.visible = False
        material.save()
        return Response({"status": 'success'})


class MaterialCategoryView(LoginRequiredMixin, ListAPIView):    # API для вывода категорий
    queryset = MaterialCategory.objects.all()
    serializer_class = MaterialCategorySerializer


class MaterialItemPage(LoginRequiredMixin, TemplateView):    # страница матриала
    template_name = "materials_item/materials_item_main.html"

    def get(self, request, *args, **kwargs):
        perms = request.user.get_group_permissions()
        filtered_perms = [perm for perm in perms if "material." in perm]

        material = Material.objects.get(pk=kwargs.get("pk"))
        material_type = get_type(material.file.name.split('.')[-1])

        can_edit = material.owner == request.user or request.user.has_perm('material.add_general')

        context = {'title': material.name,
                   'material': material,
                   'menu': get_menu(request.user),
                   'userperms': dumps(filtered_perms),
                   'material_type': material_type,
                   'can_edit': can_edit}

        if material_type == "pdf_formats":
            preview_dir = f'media/materials/pdfpreview/{material.id}.jpg'
            if not os.path.exists(preview_dir):
                pages = convert_from_path(material.file.path, 300, first_page=0, last_page=1)
                pages[0].save(preview_dir, 'JPEG')
            context['preview_dir'] = preview_dir

        return render(request, self.template_name, context)
