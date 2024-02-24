from rest_framework import serializers
from .models import NewUser, EngagementChannel, Level, Programs
from django.contrib.auth.models import Group


class NewUserGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['name']


class NewUserSerializer(serializers.ModelSerializer):
    groups = NewUserGroupSerializer(many=True)

    class Meta:
        model = NewUser
        fields = ['id', 'username', 'first_name', 'last_name', 'groups']


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


class NewUserProfileSerializer(serializers.ModelSerializer):
    groups = NewUserGroupSerializer(many=True)
    engagement_channel = EngagementChannelSerializer()
    level = LevelSerializer()
    programs = ProgramSerializer(many=True)

    class Meta:
        model = NewUser
        fields = '__all__'
