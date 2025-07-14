from typing import List

from profile_management.models import NewUser, Telegram
from profile_management.serializers import NewUserNameOnlyListSerializer

from rest_framework import serializers

from .models import TgBotJournal


class TelegramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Telegram
        fields = ['nickname', 'tg_id']


class UserTelegramSerializer(serializers.ModelSerializer):
    telegram = TelegramSerializer(read_only=True, many=True)
    self_tg = serializers.SerializerMethodField('get_is_self_tg')

    class Meta:
        model = NewUser
        fields = ['id', 'first_name', 'last_name', 'telegram', 'self_tg']

    def get_is_self_tg(self, user):
        return self.context['request'].user == user


class TgJournalSerializer(serializers.ModelSerializer):
    initiator = NewUserNameOnlyListSerializer(many=False, read_only=True)
    recipient = NewUserNameOnlyListSerializer(many=False, read_only=True)
    readed = serializers.SerializerMethodField(read_only=True)

    def get_readed(self, obj):
        if obj.data.get("status") == 'success':
            tgnote = obj.recipient.telegram.first()
            if (tgnote and tgnote.last_message_from_user_id and
                    obj.data.get("msg_id")):
                return (obj.data.get("msg_id") <=
                        tgnote.last_message_from_user_id)
            return False
        return False

    class Meta:
        model = TgBotJournal
        fields = '__all__'


class TelegramNotesSerializer(serializers.ModelSerializer):
    usertype = serializers.SerializerMethodField()
    allowed_users: List[int]
    allowed_parents: List[int]

    class Meta:
        model = Telegram
        fields = ['id', 'tg_id', 'nickname', 'usertype',
                  'join_dt', 'first_name', 'last_name']

    def __init__(self, *args, **kwargs):
        super(TelegramNotesSerializer, self).__init__(*args, **kwargs)
        self.allowed_users = Telegram.objects.filter(
            allowed_users__id=self.context.get("user_id")
        ).values_list("id", flat=True)
        self.allowed_parents = Telegram.objects.filter(
            allowed_parents__id=self.context.get("user_id")
        ).values_list("id", flat=True)

    def get_usertype(self, obj):
        if obj.id in self.allowed_users:
            return "main"
        if obj.id in self.allowed_parents:
            return "parent"
        return None
