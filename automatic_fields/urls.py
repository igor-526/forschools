from django.urls import path
from .views import AutomaticFieldAPIView

apiv1patterns = [
    path('<str:field>', AutomaticFieldAPIView.as_view()),
]
