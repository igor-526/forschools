from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from material.models import Material
from .serializers import UserTelegramSerializer
from profile_management.models import NewUser
from tgbot.utils import send_materials


class UserTelegramListAPIView(LoginRequiredMixin, ListAPIView):   # API для вывода списка пользователей c привязанным TG
    queryset = NewUser.objects.filter(telegram__isnull=False).all()
    serializer_class = UserTelegramSerializer


class SendMaterialsTGView(LoginRequiredMixin, APIView):
    def post(self, request) -> JsonResponse:
        users = request.POST.getlist("users")
        mat_ids = request.POST.getlist("materials")
        materials = Material.objects.filter(id__in=mat_ids)
        if materials:
            for user in users:
                send_materials(user, materials)
        return JsonResponse({'status': 'success'})
