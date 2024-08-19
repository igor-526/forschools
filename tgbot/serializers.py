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

    class Meta:
        model = TgBotJournal
        fields = '__all__'

