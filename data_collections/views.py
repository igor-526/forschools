from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework.generics import RetrieveUpdateDestroyAPIView, ListCreateAPIView
from dls.utils import get_menu
from profile_management.models import (EngagementChannel,
                                       Level,
                                       Programs,)
from material.models import MaterialCategory
from lesson.models import Place
from .serializers import (LevelSerializer,
                          MaterialCategorySerializer,
                          ProgramSerializer,
                          EngagementChannelSerializer,
                          PlaceSerializer,)


class CollectionPageView(LoginRequiredMixin, TemplateView):
    template_name = "collections_main.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Коллекции данных', 'menu': get_menu(request.user)}
        return render(request, self.template_name, context)


class LevelListAPIView(LoginRequiredMixin, ListCreateAPIView):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer


class LevelAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer


class MaterialCategoryListAPIView(LoginRequiredMixin, ListCreateAPIView):
    queryset = MaterialCategory.objects.all()
    serializer_class = MaterialCategorySerializer


class MaterialCategoryAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    queryset = MaterialCategory.objects.all()
    serializer_class = MaterialCategorySerializer


class ProgramListAPIView(LoginRequiredMixin, ListCreateAPIView):
    queryset = Programs.objects.all()
    serializer_class = ProgramSerializer


class ProgramAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    queryset = Programs.objects.all()
    serializer_class = ProgramSerializer


class EngagementChannelListAPIView(LoginRequiredMixin, ListCreateAPIView):
    queryset = EngagementChannel.objects.all()
    serializer_class = EngagementChannelSerializer


class EngagementChannelAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    queryset = EngagementChannel.objects.all()
    serializer_class = EngagementChannelSerializer


class PlaceListAPIView(LoginRequiredMixin, ListCreateAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer


class PlaceAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
