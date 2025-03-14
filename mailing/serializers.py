from rest_framework import serializers
from profile_management.serializers import NewUserNameOnlyListSerializer
from .models import GroupMailingTasks
from user_logs.serializers import get_role_ru


class MailingUsersListSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    telegram = serializers.SerializerMethodField()
    active = serializers.SerializerMethodField()

    class Meta:
        fields = ['id', 'name', 'role', 'email', 'telegram', 'active']

    def get_id(self, obj):
        return obj.id

    def get_active(self, obj):
        return obj.is_active

    def get_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'

    def get_role(self, obj):
        return [get_role_ru(group.name, lc=True) for group in obj.groups.all()]

    def get_email(self, obj):
        return obj.email if obj.email else None

    def get_telegram(self, obj):
        return ['Основной' if tg.usertype == "main" else f'{tg.usertype}' for tg in obj.telegram.all()]


class GroupMailingTasksListSerializer(serializers.ModelSerializer):
    result = serializers.SerializerMethodField()
    initiator = NewUserNameOnlyListSerializer(read_only=True)

    class Meta:
        model = GroupMailingTasks
        fields = ['id', 'name', 'result', 'initiator', 'dt']

    def get_result(self, obj):
        if obj.result_info.get('info') is None:
            return {"all": None,
                    "info": 0}
        count_all = obj.result_info['info']['errors'] + obj.result_info['info']['success']
        return {"all": count_all,
                "info": 2 if obj.result_info['info']['errors'] == 0 else 1}


class GroupMailingTasksItemSerializer(serializers.ModelSerializer):
    initiator = NewUserNameOnlyListSerializer(read_only=True)

    class Meta:
        model = GroupMailingTasks
        fields = ['id', 'name', 'messages', 'result_info', 'initiator', 'dt', 'users']
