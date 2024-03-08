from rest_framework import serializers
from .models import NewUser, EngagementChannel, Level, Programs, Telegram
from django.contrib.auth.models import Group


class TelegramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Telegram
        fields = '__all__'


class NewUserGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['name']


class EngagementChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EngagementChannel
        fields = '__all__'


class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = '__all__'


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programs
        fields = '__all__'


class NewUserSerializer(serializers.ModelSerializer):
    groups = NewUserGroupSerializer(many=True)
    engagement_channel = EngagementChannelSerializer()
    level = LevelSerializer()
    programs = ProgramSerializer(many=True)
    telegram = TelegramSerializer(many=True)

    class Meta:
        model = NewUser
        fields = '__all__'
