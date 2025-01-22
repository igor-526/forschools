from django.urls import path
from .views_api import AutomaticFieldAPIView

apiv1patterns = [
    path('<str:field>', AutomaticFieldAPIView.as_view()),
]
