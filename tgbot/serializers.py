from rest_framework import serializers
from profile_management.models import NewUser, Telegram
from .models import TgBotJournal
from profile_management.serializers import NewUserNameOnlyListSerializer


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
            if tgnote and tgnote.last_message_from_user_id and obj.data.get("msg_id"):
                return obj.data.get("msg_id") <= tgnote.last_message_from_user_id
            else:
                return False
        return False

    class Meta:
        model = TgBotJournal
        fields = '__all__'


class TelegramNotesAllFieldsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Telegram
        fields = ['id', 'tg_id', 'nickname', 'usertype', 'join_dt', 'first_name', 'last_name']


class TelegramNotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Telegram
        fields = ['id', 'usertype', 'join_dt', 'first_name', 'last_name']

