from django.http import Http404
from pdf2image import convert_from_path
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import Material
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .serializers import MaterialSerializer
from dls.utils import get_menu
from .utils.get_type import get_type
from dls.settings import MATERIAL_FORMATS
from .permissions import CanSeeMaterialMixin


class MaterialPage(LoginRequiredMixin, TemplateView):    # страница матриалов
    template_name = "materials_main.html"

    def get(self, request, *args, **kwargs):
        context = {
            'title': 'Материалы',
            'menu': get_menu(request.user),
            'material_formats': MATERIAL_FORMATS
        }
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
        material = self.get_object()
        material.visible = False
        material.save()
        return Response({"status": 'success'}, status=status.HTTP_200_OK)


class MaterialItemPage(CanSeeMaterialMixin, TemplateView):    # страница материала
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
            with open(material.file.path, 'r') as f:
                context['text'] = f.readlines()
        return render(request, self.template_name, context)
