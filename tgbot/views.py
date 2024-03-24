from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from material.models import Material
from .serializers import UserTelegramSerializer
from profile_management.models import NewUser
from tgbot.utils import send_material


class UserTelegramListAPIView(LoginRequiredMixin, ListAPIView):   # API для вывода списка пользователей c привязанным TG
    queryset = NewUser.objects.filter(telegram__isnull=False).all()
    serializer_class = UserTelegramSerializer


class SendMaterialTGView(LoginRequiredMixin, APIView):
    def post(self, request) -> JsonResponse:
        users = request.data.get("users")
        mat_id = request.data.get("mat_id")
        print(users, mat_id)
        material = Material.objects.get(id=mat_id)
        for user in users:
            send_material(user, material)
        return JsonResponse({'status': 'success'})
