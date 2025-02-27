from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, ListAPIView, CreateAPIView
from rest_framework import status
from profile_management.models import NewUser, Telegram
from chat.models import GroupChats
from .models import Message
from .permissions import can_see_chat
from .serializers import ChatMessageSerializer, ChatGroupInfoSerailizer


class ChatUsersListAPIView(LoginRequiredMixin, ListAPIView):
    def list(self, request, *args, **kwargs):
        from_user = self.request.query_params.get('from_user')
        if from_user:
            if can_see_chat(request, from_user):
                try:
                    from_user = NewUser.objects.get(pk=from_user)
                    chats = from_user.get_users_for_chat()
                    return Response(chats, status=status.HTTP_200_OK)
                except NewUser.DoesNotExist:
                    raise PermissionDenied()
            else:
                raise PermissionDenied()
        chats = request.user.get_users_for_chat()
        return Response(chats, status=status.HTTP_200_OK)


class ChatMessagesListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    chat_type = None

    def set_chat_type(self):
        if self.request.method == 'GET':
            self.chat_type = self.request.query_params.get('chat_type') \
                if self.request.query_params.get('chat_type') else "NewUser"
        elif self.request.method == 'POST':
            self.chat_type = self.request.POST.get('chat_type') \
                if self.request.POST.get('chat_type') else "NewUser"

    def get_queryset(self, *args, **kwargs):
        from_user = self.request.query_params.get('from_user')
        if from_user:
            if can_see_chat(self.request, from_user):
                from_user = NewUser.objects.get(pk=from_user)
            else:
                raise PermissionDenied()
        else:
            from_user = self.request.user
        queryset = None
        if self.chat_type == "NewUser":
            queryset = Message.objects.filter(
                Q(sender=from_user,
                  receiver_id=self.kwargs.get("user")) |
                Q(receiver=from_user,
                  sender_id=self.kwargs.get("user"))
            ).order_by('-date')
        elif self.chat_type == "Telegram":
            queryset = Message.objects.filter(
                Q(sender=from_user,
                  receiver_tg_id=self.kwargs.get("user")) |
                Q(receiver=from_user,
                  sender_tg_id=self.kwargs.get("user"))
            ).order_by('-date')
        elif self.chat_type == "Group":
            queryset = Message.objects.filter(
                group_chats_messages=self.kwargs.get("user")).order_by('-date')
        return queryset

    def read_messages(self, queryset):
        messages_to_read = queryset.exclude(
            Q(sender=self.request.user) |
            Q(read_data__has_key=f'nu{self.request.user.id}')
        )
        for message in messages_to_read:
            message.set_read(self.request.user.id, "NewUser")

    def list(self, request, *args, **kwargs):
        self.set_chat_type()
        queryset = self.get_queryset()
        username = "Диалог"
        if self.request.query_params.get('from_user'):
            current_user_id = self.request.query_params.get('from_user')
        else:
            current_user_id = self.request.user.id
            self.read_messages(queryset)
        serializer = self.get_serializer(queryset, many=True)
        if self.chat_type == "NewUser":
            usr = NewUser.objects.get(pk=self.kwargs.get("user"))
            username = f'{usr.first_name} {usr.last_name}'
        elif self.chat_type == "Telegram":
            tgnote = Telegram.objects.get(pk=self.kwargs.get("user"))
            username = f'{tgnote.user.first_name} {tgnote.user.last_name} [{tgnote.usertype}]'
        elif self.chat_type == "Group":
            group_chat = GroupChats.objects.get(pk=self.kwargs.get("user"))
            username = group_chat.name
        return Response({'messages': serializer.data,
                         'username': username,
                         'current_user_id': int(current_user_id)}, status=200)

    def create(self, request, *args, **kwargs):
        self.set_chat_type()
        serializer = self.get_serializer(data=request.data,
                                         context={'request': request,
                                                  'receiver': self.kwargs.get("user"),
                                                  'chat_type': self.chat_type})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChatGroupsCreateAPIView(LoginRequiredMixin, CreateAPIView):
    serializer_class = ChatGroupInfoSerailizer
