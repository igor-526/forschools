from .views import UserTelegramListAPIView, SendMaterialTGView
from django.urls import path

apiv1patterns = [
    path('all/', UserTelegramListAPIView.as_view()),  # API для вывода списка пользователей c TG
    path('sendmaterial/', SendMaterialTGView.as_view())
]
