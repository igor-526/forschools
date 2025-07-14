from chat.models import AdminMessage, GroupChats

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q

from profile_management.models import NewUser

from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import (CreateAPIView,
                                     ListAPIView,
                                     ListCreateAPIView)
from rest_framework.response import Response
from rest_framework.views import APIView

from tgbot.utils import sync_funcs

from .models import Message
from .permissions import CanSeeAdminChats, can_see_chat
from .serializers import (ChatAdminMessageSerializer,
                          ChatGroupInfoSerializer,
                          ChatMessageSerializer)
from .utils import chat_users_remove_duplicates, chat_users_sort


class ChatUsersListAPIView(LoginRequiredMixin, ListAPIView):
    def filter_chats(self, chats):
        query = self.request.query_params.get('search')
        if not chats or query is None:
            return chats
        return list(filter(
            lambda user: query in user.get('name').lower(), chats
        ))

    def list(self, request, *args, **kwargs):
        from_user = self.request.query_params.get('from_user')
        if from_user:
            if can_see_chat(request, from_user):
                try:
                    from_user = NewUser.objects.get(pk=from_user)
                    chats = from_user.get_users_for_chat(from_user=True)
                    chats = self.filter_chats(chats)
                    return Response(chats, status=status.HTTP_200_OK)
                except NewUser.DoesNotExist:
                    return Response(status=status.HTTP_404_NOT_FOUND)
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)
        chats = request.user.get_users_for_chat(from_user=False)
        chats = self.filter_chats(chats)
        return Response(chats, status=status.HTTP_200_OK)


class ChatAdminUsersListAPIView(CanSeeAdminChats, ListAPIView):
    def filter_chats(self, chats):
        query = self.request.query_params.get('search')
        if not chats or query is None:
            return chats
        return list(filter(
            lambda user: query in user.get('name').lower(), chats
        ))

    def list(self, request, *args, **kwargs):
        def get_info(u):
            info = {
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}",
                "unread": 0,
                "photo": u.photo.url,
                "last_message_text": None,
                "last_message_date": None
            }
            last_message = AdminMessage.objects.filter(
                Q(sender=u, receiver=None) | Q(receiver=u)
            ).order_by('-date').first()
            if last_message:
                info["last_message_text"] = last_message.message[:50] if (
                    last_message.message) else ""
                info["last_message_date"] = last_message.date
            return info

        users = NewUser.objects.filter(
            admin_message_sender__isnull=False
        ).exclude(groups__name="Admin").distinct()
        users = [get_info(user) for user in users] if users else []
        users = self.filter_chats(users)
        users = chat_users_remove_duplicates(users)
        users = chat_users_sort(users)
        return Response(users, status=status.HTTP_200_OK)


class ChatMessagesListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
    usertype: int = None

    def set_chat_type(self):
        if self.request.method == 'GET':
            self.usertype = int(
                self.request.query_params.get('usertype')
            )
        elif self.request.method == 'POST':
            self.usertype = int(
                self.request.POST.get('usertype')
            )

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
        if self.usertype in [0, 1]:
            queryset = Message.objects.filter(
                Q(sender=from_user,
                  sender_type=0,
                  receiver_id=self.kwargs.get("user"),
                  receiver_type=self.usertype) |
                Q(receiver=from_user,
                  receiver_type=0,
                  sender_id=self.kwargs.get("user"),
                  sender_type=self.usertype)
            ).order_by('-date')
        elif self.usertype == 3:
            queryset = Message.objects.filter(
                group_chats_messages=self.kwargs.get("user")).order_by('-date')
        elif self.usertype == 2:
            if self.request.user.groups.filter(name="Admin").exists():
                queryset = AdminMessage.objects.filter(
                    Q(sender=self.kwargs.get("user")) |
                    Q(receiver=self.kwargs.get("user"))
                ).order_by('-date')
            else:
                queryset = AdminMessage.objects.filter(
                    Q(sender=from_user) | Q(receiver=from_user)
                ).order_by('-date')

        return queryset

    def get_serializer_class(self):
        if self.usertype == 2:
            return ChatAdminMessageSerializer
        return ChatMessageSerializer

    def read_messages(self, queryset):
        if self.usertype != 2:
            messages_to_read = queryset.exclude(
                Q(sender=self.request.user) |
                Q(read_data__has_key=f'0_{self.request.user.id}')
            )
        else:
            messages_to_read = []
        for message in messages_to_read:
            message.set_read(self.request.user.id)

    def list(self, request, *args, **kwargs):
        self.set_chat_type()
        queryset = self.get_queryset()
        username = "Диалог"
        if self.request.query_params.get('from_user'):
            current_user_id = int(self.request.query_params.get('from_user'))
        else:
            current_user_id = self.request.user.id
            self.read_messages(queryset)
        serializer = self.get_serializer_class()
        if self.usertype in [0, 1]:
            usr = NewUser.objects.get(pk=self.kwargs.get("user"))
            username = f'{usr.first_name} {usr.last_name}'
            if self.usertype == 1:
                username = f'[Родители] {username}'
        elif self.usertype == 3:
            group_chat = GroupChats.objects.get(pk=self.kwargs.get("user"))
            username = group_chat.name
        elif self.usertype == 2:
            if self.request.user.groups.filter(name="Admin").exists():
                user = NewUser.objects.get(pk=self.kwargs.get("user"))
                username = f'{user.first_name} {user.last_name}'
            else:
                username = "Администратор"
        return Response(
            data={
                'messages': serializer(
                    queryset,
                    many=True,
                    context={
                        "request": request,
                        "current_user_id": current_user_id
                    }
                ).data,
                'username': username,
            },
            status=200
        )

    def create(self, request, *args, **kwargs):
        self.set_chat_type()
        serializer = self.get_serializer_class()
        serializer = serializer(data=request.data,
                                context={'request': request,
                                         'receiver': self.kwargs.get("user"),
                                         'usertype': self.usertype})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChatGroupsCreateAPIView(LoginRequiredMixin, CreateAPIView):
    serializer_class = ChatGroupInfoSerializer


class ChatUnsentAPIView(CanSeeAdminChats, APIView):
    def get(self, request, *args, **kwargs):
        return Response(data=sync_funcs.check_unsent_messages(False),
                        status=status.HTTP_200_OK)
