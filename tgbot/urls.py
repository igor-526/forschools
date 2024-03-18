from .views import UserTelegramListAPIView
from django.urls import path

apiv1patterns = [
    path('all/', UserTelegramListAPIView.as_view()),  # API для вывода списка пользователей c TG
]
