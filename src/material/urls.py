from django.urls import path

from .views import MaterialItemPage, MaterialPage
from .views_api import (MaterialAPIView,
                        MaterialEditObjectAPIView,
                        MaterialFileTextAPIView,
                        MaterialListCreateAPIView)

urlpatterns = [
    path('', MaterialPage.as_view(), name='materials'),
    path('<int:pk>', MaterialItemPage.as_view()),
]

apiv1patterns = [
    path('', MaterialListCreateAPIView.as_view()),
    path('<int:pk>/', MaterialAPIView.as_view()),
    path('get_text/', MaterialFileTextAPIView.as_view()),
    path('edit_object/<str:obj_name>/<int:pk>/',
         MaterialEditObjectAPIView.as_view()),
]
