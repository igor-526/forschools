from django.db.models import Q

from material.models import File
from material.serializers import FileSerializer

from profile_management.models import NewUser, Telegram
from profile_management.serializers import (NewUserNameOnlyListSerializer,
                                            TelegramListSerializer)

from rest_framework import serializers

from .models import AdminMessage, GroupChats, Message
from .tg_utils import tg_sync_chat_funcs


class ChatMessageSerializer(serializers.ModelSerializer):
    sender = NewUserNameOnlyListSerializer(many=False, read_only=True)
    receiver = NewUserNameOnlyListSerializer(many=False, read_only=True)
    role = serializers.SerializerMethodField()
    files = FileSerializer(many=True, read_only=True)

    class Meta:
        model = Message
        fields = "__all__"

    def get_role(self, obj):
        if self.context.get("current_user_id") is None:
            return "s"
        if obj.sender.id == self.context.get("current_user_id"):
            return "s"
        return "r"

    def create(self, validated_data):
        usertype = self.context.get("usertype")
        request = self.context.get("request")
        message = Message()
        if usertype in [0, 1]:
            message = Message.objects.create(
                **validated_data,
                receiver_id=self.context.get("receiver"),
                sender=request.user,
                sender_type=0,
                receiver_type=usertype
            )
        elif usertype == 3:
            message = Message.objects.create(**validated_data,
                                             sender=request.user)
            group = GroupChats.objects.get(id=self.context.get(
                "receiver")
            )
            group.messages.add(message)
            group.save()
        attachments = request.FILES.getlist("attachments")
        if attachments:
            att_list = []
            for attachment in attachments:
                file = File.objects.create(
                    name="Сообщение",
                    owner=request.user,
                    path=attachment,
                    extension=attachment.name.split(".")[-1]
                )
                att_list.append(file)
            message.files.set(att_list)
            message.save()
        if usertype in [0, 1]:
            tg_sync_chat_funcs.notify_message(message.id)
        else:
            tg_sync_chat_funcs.notify_admin_message(message.id)
        return message


class ChatGroupInfoSerializer(serializers.ModelSerializer):
    users = NewUserNameOnlyListSerializer(many=True,
                                          read_only=True,
                                          required=False)
    administrators = NewUserNameOnlyListSerializer(many=True,
                                                   read_only=True,
                                                   required=False)
    owner = NewUserNameOnlyListSerializer(many=False,
                                          read_only=True,
                                          required=False)
    users_tg = TelegramListSerializer(many=True,
                                      read_only=True,
                                      required=False)
    messages_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = GroupChats
        fields = ['id', 'name', 'users', 'administrators',
                  'owner', 'users_tg', 'messages_count']

    def validate(self, attrs):
        new_validated_data = {}
        request = self.context.get("request")
        name = request.POST.get("name")
        if name == "setauto":
            users = [
                        *[f"{user.first_name}" for user in
                          NewUser.objects.filter(
                              Q(pk__in=request.POST.getlist("users")) |
                              Q(pk=request.user.id)
                          )],
                        *[f"{tgnote.user.first_name} [{tgnote.usertype}]" for
                          tgnote in Telegram.objects.filter(
                                pk__in=request.POST.getlist("users_tg")
                            )]
                    ][:3]
            name = "Группа: "
            counter = -1
            symbol_counter = len(name)
            for user in users:
                if len(user) + symbol_counter + 2 < 50:
                    counter += 1
                    symbol_counter += len(user)+2
                else:
                    name = name + (", ".join(users[:counter]) + "..")
                    break
            else:
                name = name + ", ".join(users[:counter])
            if GroupChats.objects.filter(name=name).exists():
                raise serializers.ValidationError(
                    {"name": "Не удалось сгенерировать. "
                             "Введите название вручную"}
                )
            new_validated_data["name"] = name
        else:
            if GroupChats.objects.filter(name=name).exists():
                raise serializers.ValidationError(
                    {"name": "Группа с таким наименованием "
                             "уже существует"}
                )
            new_validated_data["name"] = name
        new_validated_data["owner"] = request.user
        return new_validated_data

    def get_messages_count(self, obj):
        return obj.messages.count()

    def create(self, validated_data):
        request = self.context.get("request")
        group = GroupChats.objects.create(**validated_data)
        users = request.POST.getlist("users")
        if users:
            group.users.set(NewUser.objects.filter(
                Q(pk__in=users) | Q(pk=request.user.id)
            ))
        users_tg = request.POST.getlist("users_tg")
        if users_tg:
            group.users_tg.set(Telegram.objects.filter(pk__in=users_tg))
        group.administrators.add(request.user)
        group.save()
        return group


class ChatAdminMessageSerializer(serializers.ModelSerializer):
    sender = NewUserNameOnlyListSerializer(many=False, read_only=True)
    receiver = NewUserNameOnlyListSerializer(many=False, read_only=True)
    files = FileSerializer(many=True, read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = AdminMessage
        fields = "__all__"

    def get_role(self, obj):
        if obj.sender.id == self.context.get("request").user.id:
            return "s"
        return "r"

    def create(self, validated_data):
        request = self.context.get("request")
        message_params = {"sender": request.user}
        if request.user.groups.filter(name="Admin").exists():
            message_params["receiver_id"] = self.context.get("receiver")
        message = AdminMessage.objects.create(**validated_data,
                                              **message_params)
        attachments = request.FILES.getlist("attachments")
        if attachments:
            att_list = []
            for attachment in attachments:
                file = File.objects.create(
                    name="Сообщение администратору",
                    owner=request.user,
                    path=attachment,
                    extension=attachment.name.split(".")[-1]
                )
                att_list.append(file)
            message.files.set(att_list)
            message.save()
        tg_sync_chat_funcs.notify_admin_message(message.id)
        return message
