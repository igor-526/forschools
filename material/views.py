from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework.response import Response

from .models import Material, MaterialCategory
from rest_framework.generics import ListCreateAPIView, ListAPIView
from .serializers import MaterialSerializer, MaterialCategorySerializer


class MaterialPage(LoginRequiredMixin, TemplateView):    # страница матриалов
    template_name = "materials.html"

    def get(self, request, *args, **kwargs):
        data = Material.objects.all()
        context = {'materials': data}
        return render(request, self.template_name, context)


class MaterialListView(LoginRequiredMixin, ListCreateAPIView):  # API для просмотра и добавления материалов
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

    def get_queryset(self):
        param_type = self.request.query_params.get('type')
        if not param_type or param_type == '2':
            return Material.objects.filter(type=2)
        elif param_type == "1":
            return Material.objects.filter(type=1, owner=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class MaterialCategoryView(LoginRequiredMixin, ListAPIView):    # API для вывода категорий
    queryset = MaterialCategory.objects.all()
    serializer_class = MaterialCategorySerializer

