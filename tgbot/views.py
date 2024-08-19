from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.views import APIView
from dls.utils import get_menu
from lesson.models import Lesson
from material.models import Material
from .serializers import UserTelegramSerializer, TgJournalSerializer
from profile_management.models import NewUser
from tgbot.utils import send_materials
from .models import TgBotJournal
from .create_bot import bot


class TgJournalPage(LoginRequiredMixin, TemplateView):  # страница журнала действий Telegram
    template_name = "tgbot_journal.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Журнал Telegram',
                   'menu': get_menu(request.user)}
        return render(request, self.template_name, context)


class TgJournalListAPIView(LoginRequiredMixin, ListAPIView):
    queryset = TgBotJournal.objects.all()
    serializer_class = TgJournalSerializer


class TgJournalItemAPIView(LoginRequiredMixin, RetrieveAPIView):
    queryset = TgBotJournal.objects.all()
    serializer_class = TgJournalSerializer


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
