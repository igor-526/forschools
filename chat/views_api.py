from _operator import itemgetter

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, ListAPIView, CreateAPIView
from rest_framework import status
from rest_framework.views import APIView

from profile_management.models import NewUser, Telegram
from chat.models import GroupChats, AdminMessage
from tgbot.utils import sync_funcs
from .models import Message
from .permissions import can_see_chat, CanSeeAdminChats
from .serializers import (ChatMessageSerializer, ChatGroupInfoSerializer,
                          ChatAdminMessageSerializer)


class ChatUsersListAPIView(LoginRequiredMixin, ListAPIView):
    def filter_chats(self, chats):
        query = self.request.query_params.get('search')
        if not chats or query is None:
            return chats
        return list(filter(lambda user: query in user.get('name').lower(), chats))

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
                    raise PermissionDenied()
            else:
                raise PermissionDenied()
        chats = request.user.get_users_for_chat(from_user=False)
        chats = self.filter_chats(chats)
        return Response(chats, status=status.HTTP_200_OK)


class ChatAdminUsersListAPIView(CanSeeAdminChats, ListAPIView):
    def filter_chats(self, chats):
        query = self.request.query_params.get('search')
        if not chats or query is None:
            return chats
        return list(filter(lambda user: query in user.get('name').lower(), chats))

    def list(self, request, *args, **kwargs):
        def _sort_users_for_chat(users):
            filtered_users = users
            unread_list = list(filter(lambda u: u.get("unread"), filtered_users))
            has_messages_list = list(
                filter(lambda u: u.get("last_message_text") is not None and u not in unread_list, filtered_users))
            no_messages_list = list(filter(lambda u: u.get("last_message_text") is None, filtered_users))
            unread_list = sorted(unread_list, key=itemgetter("last_message_date"), reverse=True)
            has_messages_list = sorted(has_messages_list, key=itemgetter("last_message_date"), reverse=True)
            no_messages_list = sorted(no_messages_list, key=itemgetter("name"))
            return [*unread_list, *has_messages_list, *no_messages_list]

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
                info["last_message_text"] = last_message.message[:50] if last_message.message else ""
                info["last_message_date"] = last_message.date
            return info

        users = NewUser.objects.filter(admin_message_sender__isnull=False).exclude(groups__name="Admin").distinct()
        users = [get_info(user) for user in users] if users else []
        users = self.filter_chats(users)
        users = _sort_users_for_chat(users)
        return Response(users, status=status.HTTP_200_OK)


class ChatMessagesListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
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
        elif self.chat_type == "Admin":
            if self.request.user.groups.filter(name="Admin").exists():
                queryset = AdminMessage.objects.filter(
                    Q(sender=self.kwargs.get("user")) | Q(receiver=self.kwargs.get("user"))
                ).order_by('-date')
            else:
                queryset = AdminMessage.objects.filter(
                    Q(sender=from_user) | Q(receiver=from_user)
                ).order_by('-date')

        return queryset

    def get_serializer_class(self):
        if self.chat_type == "Admin":
            return ChatAdminMessageSerializer
        return ChatMessageSerializer

    def read_messages(self, queryset):
        if self.chat_type != "Admin":
            messages_to_read = queryset.exclude(
                Q(sender=self.request.user) |
                Q(read_data__has_key=f'nu{self.request.user.id}')
            )
        else:
            messages_to_read = []
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
        serializer = self.get_serializer_class()
        if self.chat_type == "NewUser":
            usr = NewUser.objects.get(pk=self.kwargs.get("user"))
            username = f'{usr.first_name} {usr.last_name}'
        elif self.chat_type == "Telegram":
            tgnote = Telegram.objects.get(pk=self.kwargs.get("user"))
            username = f'{tgnote.user.first_name} {tgnote.user.last_name} [{tgnote.usertype}]'
        elif self.chat_type == "Group":
            group_chat = GroupChats.objects.get(pk=self.kwargs.get("user"))
            username = group_chat.name
        elif self.chat_type == "Admin":
            if self.request.user.groups.filter(name="Admin").exists():
                user = NewUser.objects.get(pk=self.kwargs.get("user"))
                username = f'{user.first_name} {user.last_name}'
            else:
                username = "Администратор"
        return Response({'messages': serializer(queryset, many=True,
                                                context={"request": request}).data,
                         'username': username,
                         'current_user_id': int(current_user_id)}, status=200)

    def create(self, request, *args, **kwargs):
        self.set_chat_type()
        serializer = self.get_serializer_class()
        serializer = serializer(data=request.data,
                                context={'request': request,
                                         'receiver': self.kwargs.get("user"),
                                         'chat_type': self.chat_type})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChatGroupsCreateAPIView(LoginRequiredMixin, CreateAPIView):
    serializer_class = ChatGroupInfoSerializer


class ChatUnsentAPIView(CanSeeAdminChats, APIView):
    def get(self, request, *args, **kwargs):
        return Response(sync_funcs.check_unsent_messages(False), status=status.HTTP_200_OK)
