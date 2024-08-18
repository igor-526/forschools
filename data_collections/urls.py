from django.urls import path
from .views import (CollectionPageView,
                    LevelListAPIView,
                    LevelAPIView,
                    MaterialCategoryListAPIView,
                    MaterialCategoryAPIView,
                    EngagementChannelListAPIView,
                    EngagementChannelAPIView,
                    PlaceListAPIView,
                    PlaceAPIView,
                    MaterialLevelListAPIView,
                    MaterialLevelAPIView)

urlpatterns = [
    path('administration/collections', CollectionPageView.as_view(),
         name='admin_collections'),     # коллекция данных (администрирование)
]

apiv1patterns = [
    path("collections/levels/", LevelListAPIView.as_view()),
    path("collections/levels/<int:pk>", LevelAPIView.as_view()),
    path("collections/mat_cats/", MaterialCategoryListAPIView.as_view()),
    path("collections/mat_cats/<int:pk>", MaterialCategoryAPIView.as_view()),
    path("collections/eng_channels/", EngagementChannelListAPIView.as_view()),
    path("collections/eng_channels/<int:pk>", EngagementChannelAPIView.as_view()),
    path("collections/lesson_places/", PlaceListAPIView.as_view()),
    path("collections/lesson_places/<int:pk>", PlaceAPIView.as_view()),
    path("collections/mat_levels/", MaterialLevelListAPIView.as_view()),
    path("collections/mat_levels/<int:pk>", MaterialLevelAPIView.as_view()),
]
