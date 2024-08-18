from aiogram.methods import Response
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.http import JsonResponse
from django.utils import timezone

from .models import Message
from .serializers import ChatMessageSerializer
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework.generics import ListCreateAPIView, ListAPIView
from rest_framework import status
from dls.utils import get_menu


class ChatPageTemplateView(LoginRequiredMixin, TemplateView):  # страница домашних заданий
    template_name = "chat_main.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Сообщения',
                   'menu': get_menu(request.user)}
        return render(request, self.template_name, context)


class ChatUsersListView(LoginRequiredMixin, ListAPIView):
    def list(self, request, *args, **kwargs):
        chats = request.user.get_users_for_chat()
        return JsonResponse(chats, safe=False, status=status.HTTP_200_OK)


class ChatMessagesListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = ChatMessageSerializer

    def get_queryset(self, *args, **kwargs):
        queryset = Message.objects.filter(
            Q(sender=self.request.user,
              receiver_id=self.kwargs.get("user")) |
            Q(receiver=self.request.user,
              sender_id=self.kwargs.get("user"))
        ).order_by('-date')
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        queryset.filter(sender_id=self.kwargs.get("user"),
                        read__isnull=True).update(read=timezone.now())
        serializer = self.get_serializer(queryset, many=True)
        return JsonResponse(serializer.data, status=200, safe=False)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data,
                                         context={'request': request,
                                                  'receiver': self.kwargs.get("user")})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)

