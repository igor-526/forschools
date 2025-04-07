from datetime import datetime
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from lesson.models import Lesson
from material.models import Material
from .serializers import (UserTelegramSerializer, TgJournalSerializer,
                          TelegramNotesAllFieldsSerializer, TelegramNotesSerializer)
from profile_management.models import NewUser, Telegram, ProfileEventsJournal
from tgbot.utils import send_materials
from .models import TgBotJournal


class TgJournalListAPIView(LoginRequiredMixin, ListAPIView):
    def filter_queryset_all(self, queryset):
        query = dict()
        event = self.request.query_params.getlist("event")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        time_from = self.request.query_params.get("time_from")
        time_to = self.request.query_params.get("time_to")
        initiator = self.request.query_params.getlist("initiator")
        recipient = self.request.query_params.getlist("recipient")
        stat = self.request.query_params.getlist("status")
        if event:
            query['event__in'] = event
        if date_from:
            date_from = datetime.strptime(date_from, "%Y-%m-%d")
            query['dt__date__gte'] = date_from
        if date_to:
            date_to = datetime.strptime(date_to, "%Y-%m-%d")
            query['dt__date__lte'] = date_to
        if time_from:
            time_from = datetime.strptime(time_from, "%H:%M").time()
            query['dt__time__gte'] = time_from
        if time_to:
            time_to = datetime.strptime(time_to, "%H:%M").time()
            query['dt__time__lte'] = time_to
        if recipient:
            query['recipient__id__in'] = recipient
        if stat:
            query['data__status__in'] = stat
        queryset = queryset.filter(**query)
        if initiator and queryset:
            if "0" in initiator:
                q = Q(initiator__id__in=initiator) | Q(initiator__isnull=True)
            else:
                q = Q(initiator__id__in=initiator)
            queryset = queryset.filter(q)
        offset = int(self.request.query_params.get("offset")) if self.request.query_params.get("offset") else 0
        return queryset.distinct()[offset:offset + 50] if queryset else None

    def get_queryset(self):
        queryset = None
        if self.request.user.groups.filter(name="Admin"):
            mq = Q(event__in=[7, 10])
        else:
            mq = Q(event__in=[7, 10], initiator=self.request.user) | Q(event__in=[7, 10],
                                                                       recipient__in=[self.request.user, None])

        if self.request.user.groups.filter(name="Admin").exists():
            queryset = TgBotJournal.objects.filter(Q(
                event__in=[1, 2, 3, 4, 5, 6, 8, 9, 11]
            ) | mq)
        elif self.request.user.groups.filter(name="Metodist").exists():
            queryset = TgBotJournal.objects.filter(Q(
                event__in=[1, 2, 3, 4, 5, 6, 8, 9, 11],
                initiator__groups__name__in=["Teacher", "Listener"],
                recipient__groups__name__in=["Teacher", "Listener"],
            ) | Q(
                event__in=[1, 2, 3, 4, 5, 6, 8, 9, 11],
                initiator__isnull=True,
                recipient__groups__name__in=["Teacher", "Listener"],
            ) | Q(
                event__in=[1, 2, 3, 4, 5, 6, 8, 9, 11],
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
                event__in=[1, 2, 3, 4, 5, 6, 8, 9],
                initiator__id__in=users_ids,
                recipient__id__in=users_ids,
            ) | Q(
                event__in=[1, 2, 3, 4, 5, 6, 8, 9],
                initiator__isnull=True,
                recipient__id__in=users_ids,
            ) | mq)
        queryset = self.filter_queryset_all(queryset)
        return queryset

    serializer_class = TgJournalSerializer


class TgJournalItemAPIView(LoginRequiredMixin, RetrieveAPIView):
    queryset = TgBotJournal.objects.all()
    serializer_class = TgJournalSerializer


class UserTelegramListAPIView(LoginRequiredMixin, ListAPIView):
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
            ProfileEventsJournal.objects.create(
                event=3,
                user=tg_note.user,
                initiator=request.user
            )
            users_count = tg_note.allowed_users.count()
            if users_count > 1:
                tg_note.allowed_users.remove(tg_note.user)
            else:
                tg_note.delete()
        else:
            tg_notes = Telegram.objects.filter(user=tg_note.user)
            ProfileEventsJournal.objects.create(
                event=2,
                user=tg_note.user,
                initiator=request.user
            )
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


class TelegramSetMainAPIView(LoginRequiredMixin, APIView):
    def post(self, request, *args, **kwargs):
        try:
            tg_note_selected = Telegram.objects.get(pk=kwargs.get("pk"))
            tg_note_main = Telegram.objects.filter(user=tg_note_selected.user,
                                                   usertype="main").exclude(id=tg_note_selected.id).first()
            if not tg_note_main:
                raise Telegram.DoesNotExist
        except Telegram.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        tg_note_main.usertype = tg_note_selected.usertype
        tg_note_selected.usertype = "main"
        tg_note_main.save()
        tg_note_selected.save()
        return Response({'status': 'success'}, status=status.HTTP_200_OK)
