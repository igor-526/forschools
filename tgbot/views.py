from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework.generics import ListAPIView
from .serializers import UserTelegramSerializer
from profile_management.models import NewUser


class UserTelegramListAPIView(LoginRequiredMixin, ListAPIView):     # API для вывода списка пользователей c привязанным TG
    queryset = NewUser.objects.filter(telegram__isnull=False).all()
    serializer_class = UserTelegramSerializer

