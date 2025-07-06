from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import NewUser, Telegram, ProfileEventsJournal
from django.contrib.auth.models import Group
from data_collections.serializers import (EngagementChannelSerializer,
                                          LevelSerializer)
from .permissions import (get_editable_perm,
                          get_can_add_new_engch_lvl_prg_perm,
                          get_secretinfo_perm)


class NewUserGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['name']


class NewUserDetailSerializer(serializers.ModelSerializer):
    groups = NewUserGroupSerializer(many=True, read_only=True)
    engagement_channel = EngagementChannelSerializer(read_only=True)
    level = LevelSerializer(read_only=True)
    can_edit = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = NewUser
        exclude = ['password', 'is_superuser', 'is_staff', 'tg_code',
                   'user_permissions']

    def get_can_edit(self, obj):
        request = self.context.get('request')
        return get_secretinfo_perm(request.user, obj)

    def set_groups(self, instance: NewUser):
        request = self.context.get("request")
        groups = request.POST.getlist('role')
        if len(groups) == 0:
            raise ValidationError(
                {'role': 'Необходимо выбрать хотя бы одну роль'}
            )
        if (("Admin" in groups) and
                (not request.user.has_perm('auth.register_admin'))):
            raise ValidationError(
                {'role': 'Вы не можете дать роль администратора'}
            )
        if (("Metodist" in groups) and
                (not request.user.has_perm('auth.register_metodist'))):
            raise ValidationError(
                {'role': 'Вы не можете дать роль методиста'}
            )
        if (("Teacher" in groups) and
                (not request.user.has_perm('auth.register_teacher'))):
            raise ValidationError(
                {'role': 'Вы не можете дать роль преподавателя'}
            )
        if (("Curator" in groups) and
                (not request.user.has_perm('auth.register_curator'))):
            raise ValidationError(
                {'role': 'Вы не можете дать роль куратора'}
            )
        if (("Listener" in groups) and
                (not request.user.has_perm('auth.edit_listener'))):
            raise ValidationError(
                {'role': 'Вы не можете редактировать учеников'}
            )
        status = instance.set_groups(groups)
        if status != "success":
            raise ValidationError({'role': status})

    def set_engagement_channel(self, instance: NewUser, can_create):
        request = self.context.get("request")
        eng_ch = request.POST.get('eng_channel') \
            if request.POST.get('eng_channel') \
            else request.POST.get('eng_channel_new')
        status = instance.set_engagement_channel(eng_ch, can_create)
        if status != "success":
            raise ValidationError({'eng_channel': status})

    def set_level(self, instance: NewUser, can_create):
        request = self.context.get("request")
        level = request.POST.get('lvl') if request.POST.get('lvl') \
            else request.POST.get('lvl_new')
        status = instance.set_level(level, can_create)
        if status != "success":
            raise ValidationError({'lvl': status})

    def update(self, instance: NewUser, validated_data):
        request = self.context.get("request")
        if get_editable_perm(request.user, instance):
            can_create = get_can_add_new_engch_lvl_prg_perm(request.user)
            self.set_groups(instance)
            self.set_level(instance, can_create)
            self.set_engagement_channel(instance, can_create)
            instance.set_lessons_type(request.POST.get('private_lessons'),
                                      request.POST.get('group_lessons'))
            return (super(NewUserDetailSerializer, self)
                    .update(instance, validated_data))
        else:
            raise PermissionDenied


class NewUserListSerializer(serializers.ModelSerializer):
    groups = NewUserGroupSerializer(many=True)
    can_edit = serializers.SerializerMethodField(read_only=True)
    tg = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = NewUser
        fields = ['id', 'first_name', 'last_name', 'patronymic',
                  'username', 'groups', 'is_active',
                  'can_edit', 'tg', 'last_activity', 'last_activity_type']

    def get_can_edit(self, obj):
        request = self.context.get('request')
        return get_editable_perm(request.user, obj)

    def get_tg(self, obj):
        return (obj.telegram_allowed_user.exists() or
                obj.telegram_allowed_parent.exists())


class NewUserNameOnlyListSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewUser
        fields = ['id', 'first_name', 'last_name']


class NewUserLastMessageDateListSerializer(serializers.ModelSerializer):
    last_message_date = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = NewUser
        fields = ['id', 'first_name', 'last_name', 'last_message_date']

    def get_last_message_date(self, obj):
        return obj.get_last_message_date()


class TelegramListSerializer(serializers.ModelSerializer):
    user = NewUserListSerializer(read_only=True, many=False, required=False)

    class Meta:
        model = Telegram
        fields = ['id', 'user', 'usertype']


class ProfileEventsJournalSerializer(serializers.ModelSerializer):
    user = NewUserListSerializer(read_only=True,
                                 many=False,
                                 required=False)
    initiator = NewUserListSerializer(read_only=True,
                                      many=False,
                                      required=False)

    class Meta:
        model = ProfileEventsJournal
        fields = "__all__"
