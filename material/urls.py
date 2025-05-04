from django.urls import path
from .views import MaterialPage, MaterialItemPage
from .views_api import (MaterialListCreateAPIView,
                        MaterialAPIView,
                        MaterialFileTextAPIView)

urlpatterns = [
    path('', MaterialPage.as_view(), name='materials'),
    path('<int:pk>', MaterialItemPage.as_view()),
]

apiv1patterns = [
    path('', MaterialListCreateAPIView.as_view()),
    path('<int:pk>/', MaterialAPIView.as_view()),
    path('get_text/', MaterialFileTextAPIView.as_view()),
]
