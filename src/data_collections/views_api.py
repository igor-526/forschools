from django.contrib.auth.mixins import LoginRequiredMixin

from lesson.models import Place

from material.models import MaterialCategory, MaterialLevel

from profile_management.models import (EngagementChannel,
                                       Level)

from rest_framework.generics import (ListCreateAPIView,
                                     RetrieveUpdateDestroyAPIView)

from .serializers import (EngagementChannelSerializer,
                          LevelSerializer,
                          MaterialCategorySerializer,
                          MaterialLevelSerializer,
                          PlaceSerializer)


class LevelListAPIView(LoginRequiredMixin, ListCreateAPIView):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer


class LevelAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer


class MaterialCategoryListAPIView(LoginRequiredMixin, ListCreateAPIView):
    queryset = MaterialCategory.objects.all()
    serializer_class = MaterialCategorySerializer


class MaterialCategoryAPIView(LoginRequiredMixin,
                              RetrieveUpdateDestroyAPIView):
    queryset = MaterialCategory.objects.all()
    serializer_class = MaterialCategorySerializer


class EngagementChannelListAPIView(LoginRequiredMixin, ListCreateAPIView):
    queryset = EngagementChannel.objects.all()
    serializer_class = EngagementChannelSerializer


class EngagementChannelAPIView(LoginRequiredMixin,
                               RetrieveUpdateDestroyAPIView):
    queryset = EngagementChannel.objects.all()
    serializer_class = EngagementChannelSerializer


class PlaceListAPIView(LoginRequiredMixin, ListCreateAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer


class PlaceAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer


class MaterialLevelListAPIView(LoginRequiredMixin, ListCreateAPIView):
    queryset = MaterialLevel.objects.all()
    serializer_class = MaterialLevelSerializer


class MaterialLevelAPIView(LoginRequiredMixin,
                           RetrieveUpdateDestroyAPIView):
    queryset = MaterialLevel.objects.all()
    serializer_class = MaterialLevelSerializer
