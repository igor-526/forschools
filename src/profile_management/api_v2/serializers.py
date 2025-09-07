from rest_framework import serializers

from profile_management.models import NewUser


class NewUserNameListSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewUser
        fields = ['id', 'first_name', 'last_name']


class NewUserNameRolesListSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewUser
        fields = ['id', 'first_name', 'last_name', 'roles']


class NewUserSerializer(serializers.ModelSerializer):
    activity = serializers.SerializerMethodField()
    connect = serializers.SerializerMethodField()

    class Meta:
        model = NewUser
        fields = ['id', 'first_name', 'last_name', 'patronymic', 'roles', 'activity', 'connect', 'is_active', 'username']

    @staticmethod
    def get_activity(obj: NewUser):
        return {"last_activity": obj.last_activity,
                "activity_type": obj.last_activity_type}

    @staticmethod
    def get_connect(obj: NewUser):
        return {"tg": 0}