from datetime import datetime
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from dls.utils import get_menu
from lesson.models import Lesson
from material.models import Material
from .serializers import (UserTelegramSerializer, TgJournalSerializer,
                          TelegramNotesAllFieldsSerializer, TelegramNotesSerializer)
from profile_management.models import NewUser, Telegram
from tgbot.utils import send_materials
from .models import TgBotJournal


class TgJournalPage(LoginRequiredMixin, TemplateView):  # страница журнала действий Telegram
    template_name = "tgbot_journal.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Журнал Telegram',
                   'menu': get_menu(request.user)}
        return render(request, self.template_name, context)


class TgJournalListAPIView(LoginRequiredMixin, ListAPIView):
    def filter_event(self, queryset):
        event = self.request.query_params.getlist("event")
        if event:
            return queryset.filter(event__in=event)
        return queryset

    def filter_date(self, queryset):
        date = self.request.query_params.get("date")
        if date:
            date = datetime.strptime(date, "%Y-%m-%d")
            return queryset.filter(dt__date=date)
        return queryset

    def filter_time_from(self, queryset):
        time_from = self.request.query_params.get("timeFrom")
        if time_from:
            time_from = datetime.strptime(time_from, "%H:%M").time()
            return queryset.filter(dt__time__gte=time_from)
        return queryset

    def filter_time_to(self, queryset):
        time_to = self.request.query_params.get("timeTo")
        if time_to:
            time_from = datetime.strptime(time_to, "%H:%M").time()
            return queryset.filter(dt__time__lte=time_from)
        return queryset

    def filter_initiator(self, queryset):
        initiator = self.request.query_params.getlist("initiator")
        if initiator:
            if "0" in initiator:
                q = Q(initiator__id__in=initiator) | Q(initiator__isnull=True)
            else:
                q = Q(initiator__id__in=initiator)
            return queryset.filter(q)
        return queryset

    def filter_recipient(self, queryset):
        recipient = self.request.query_params.getlist("recipient")
        if recipient:
            return queryset.filter(recipient__id__in=recipient)
        return queryset

    def filter_status(self, queryset):
        stat = self.request.query_params.getlist("status")
        if stat:
            return queryset.filter(data__status__in=stat)
        return queryset

    def get_queryset(self):
        queryset = None
        if self.request.user.user_permissions.filter(codename="can_read_all_messages").exists():
            mq = Q(event=7)
        else:
            mq = Q(event=7, initiator=self.request.user) | Q(event=7, recipient=self.request.user)

        if self.request.user.groups.filter(name="Admin").exists():
            queryset = TgBotJournal.objects.filter(Q(
                event__in=[1, 2, 3, 4, 5, 6]
            ) | mq)
        elif self.request.user.groups.filter(name="Metodist").exists():
            queryset = TgBotJournal.objects.filter(Q(
                event__in=[1, 2, 3, 4, 5, 6],
                initiator__groups__name__in=["Teacher", "Listener"],
                recipient__groups__name__in=["Teacher", "Listener"],
            ) | Q(
                event__in=[1, 2, 3, 4, 5, 6],
                initiator__isnull=True,
                recipient__groups__name__in=["Teacher", "Listener"],
            ) | Q(
                event__in=[1, 2, 3, 4, 5, 6],
                initiator=self.request.user,
                recipient=self.request.user,
            ) | mq)
        elif self.request.user.groups.filter(name="Teacher").exists():
            users_ids = [usr.id for usr in NewUser.objects.filter(
                Q(plan_listeners__teacher=self.request.user,
                  is_active=True) |
                Q(plan_listeners__phases__lessons__replace_teacher=self.request.user,
                  is_active=True) |
                Q(id=self.request.user.id)
            ).distinct()]
            queryset = TgBotJournal.objects.filter(Q(
                event__in=[1, 2, 3, 4, 5, 6],
                initiator__id__in=users_ids,
                recipient__id__in=users_ids,
            ) | Q(
                event__in=[1, 2, 3, 4, 5, 6],
                initiator__isnull=True,
                recipient__id__in=users_ids,
            ) | mq)
        queryset = self.filter_event(queryset)
        queryset = self.filter_date(queryset)
        queryset = self.filter_time_from(queryset)
        queryset = self.filter_time_to(queryset)
        queryset = self.filter_initiator(queryset)
        queryset = self.filter_recipient(queryset)
        queryset = self.filter_status(queryset)
        return queryset[:50]

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

    def post(self, request):
        users = self.get_users(request)
        mat_ids = request.POST.getlist("materials")
        materials = Material.objects.filter(id__in=mat_ids)
        if materials:
            for user in NewUser.objects.filter(id__in=users):
                send_materials(request.user, user, materials, "manual")
        return Response({'status': 'success'}, status=status.HTTP_200_OK)


class TelegramSettingsAPIView(LoginRequiredMixin, APIView):
    def get_admin_mode(self, *args, **kwargs):
        user_id = kwargs.get("user_id")
        if user_id == self.request.user.id or self.request.user.groups.filter(name="Admin").exists():
            return True
        return False

    def get_queryset(self, *args, **kwargs):
        queryset = Telegram.objects.filter(user__id=kwargs.get("user_id"))
        return queryset

    def get_serializer_class(self, *args, **kwargs):
        if self.get_admin_mode(*args, **kwargs):
            return TelegramNotesAllFieldsSerializer
        return TelegramNotesSerializer

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset(*args, **kwargs)
        serializer = self.get_serializer_class()
        serialized = serializer(queryset, many=True)
        return Response({
            'admin_mode': self.get_admin_mode(*args, **kwargs),
            'telegrams': serialized.data,
            'code': NewUser.objects.get(pk=kwargs.get("user_id")).tg_code
        },
            status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        tg_note = Telegram.objects.get(pk=kwargs.get("user_id"))
        if tg_note.usertype != "main":
            tg_note.delete()
        else:
            tg_notes = Telegram.objects.filter(user=tg_note.user)
            for tg in tg_notes:
                tg.delete()
        return Response({'status': 'success'}, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        tg_note = Telegram.objects.get(pk=kwargs.get("user_id"))
        if tg_note.usertype != "main":
            ut = request.data.get("usertype")
            if ut:
                if len(ut) <= 20:
                    tg_note.usertype = ut
                    tg_note.save()
                    return Response({'status': 'success'}, status=status.HTTP_200_OK)
                else:
                    return Response({'error': 'Ограничение 20 символов'},
                                    status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'error': 'Обязательное поле'},
                                status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Невозможно поменять роль основного Telegram'},
                            status=status.HTTP_400_BAD_REQUEST)
