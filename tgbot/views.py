from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView

from lesson.models import Lesson
from material.models import Material
from .serializers import UserTelegramSerializer
from profile_management.models import NewUser
from tgbot.utils import send_materials


class UserTelegramListAPIView(LoginRequiredMixin, ListAPIView):   # API для вывода списка пользователей c привязанным TG
    queryset = NewUser.objects.filter(telegram__isnull=False).all()
    serializer_class = UserTelegramSerializer


class SendMaterialsTGView(LoginRequiredMixin, APIView):
    def get_users(self, request):
        users = request.POST.getlist("users")
        if not users:
            lesson = request.POST.get("lesson_id")
            try:
                lesson = Lesson.objects.get(id=lesson)
                users = [listener.id for listener in lesson.get_listeners()]
            except:
                return None
        return users

    def post(self, request) -> JsonResponse:
        users = self.get_users(request)
        mat_ids = request.POST.getlist("materials")
        materials = Material.objects.filter(id__in=mat_ids)
        if materials:
            for user in users:
                send_materials(user, materials)
        return JsonResponse({'status': 'success'}, status=status.HTTP_200_OK)
