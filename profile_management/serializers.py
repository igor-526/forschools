from rest_framework import serializers
from .models import NewUser, Telegram
from django.contrib.auth.models import Group
from data_collections.serializers import EngagementChannelSerializer, LevelSerializer, ProgramSerializer


class TelegramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Telegram
        fields = '__all__'


class NewUserGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['name']


class NewUserDetailSerializer(serializers.ModelSerializer):
    groups = NewUserGroupSerializer(many=True)
    engagement_channel = EngagementChannelSerializer()
    level = LevelSerializer()
    programs = ProgramSerializer(many=True)
    telegram = TelegramSerializer(many=True)

    class Meta:
        model = NewUser
        exclude = ['password']


class NewUserListSerializer(serializers.ModelSerializer):
    groups = NewUserGroupSerializer(many=True)

    class Meta:
        model = NewUser
        fields = ['id', 'first_name', 'last_name', 'username', 'groups', 'is_active']


class NewUserNameOnlyListSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewUser
        fields = ['id', 'first_name', 'last_name']
