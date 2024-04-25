from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import NewUser, Telegram
from django.contrib.auth.models import Group
from data_collections.serializers import EngagementChannelSerializer, LevelSerializer, ProgramSerializer
from .permissions import get_editable_perm, get_can_add_new_engch_lvl_prg_perm, get_deactivate_perm


class TelegramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Telegram
        fields = '__all__'


class NewUserGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['name']


class NewUserDetailSerializer(serializers.ModelSerializer):
    groups = NewUserGroupSerializer(many=True, read_only=True)
    engagement_channel = EngagementChannelSerializer(read_only=True)
    level = LevelSerializer(read_only=True)
    programs = ProgramSerializer(many=True, read_only=True)
    telegram = TelegramSerializer(many=True, read_only=True)
    can_deactivate = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = NewUser
        exclude = ['password']

    def get_can_deactivate(self, obj):
        request = self.context.get('request')
        return get_deactivate_perm(request.user, obj)

    def set_groups(self, instance: NewUser):
        request = self.context.get("request")
        groups = request.POST.getlist('role')
        if len(groups) == 0:
            raise ValidationError({'role': 'Необходимо выбрать хотя бы одну роль'})
        if ("Admin" in groups) and (not request.user.has_perm('auth.register_admin')):
            raise ValidationError({'role': 'Вы не можете дать роль администратора'})
        if ("Metodist" in groups) and (not request.user.has_perm('auth.register_metodist')):
            raise ValidationError({'role': 'Вы не можете дать роль методиста'})
        if "Curator" in groups:
            raise ValidationError({'role': 'Данная роль пока не поддерживается'})
        if ("Teacher" in groups) and (not request.user.has_perm('auth.register_teacher')):
            raise ValidationError({'role': 'Вы не можете дать роль преподавателя'})
        if ("Listener" in groups) and (not request.user.has_perm('auth.edit_listener')):
            raise ValidationError({'role': 'Вы не можете редактировать учеников'})
        status = instance.set_groups(groups)
        if status != "success":
            raise ValidationError({'role': status})

    def set_engagement_channel(self, instance: NewUser, can_create):
        request = self.context.get("request")
        eng_ch = request.POST.get('eng_channel') \
            if request.POST.get('eng_channel') else request.POST.get('eng_channel_new')
        status = instance.set_engagement_channel(eng_ch, can_create)
        if status != "success":
            raise ValidationError({'eng_channel': status})

    def set_level(self, instance: NewUser, can_create):
        request = self.context.get("request")
        level = request.POST.get('lvl') if request.POST.get('lvl') else request.POST.get('lvl_new')
        status = instance.set_level(level, can_create)
        if status != "success":
            raise ValidationError({'lvl': status})

    def set_programs(self, instance: NewUser, can_create=False):
        request = self.context.get("request")
        print(request.POST)
        programlist = request.POST.getlist('prog')
        program_new = request.POST.get('prog_new')
        if program_new and not can_create:
            raise ValidationError({'prog': "Вы не можете создавать программы обучения"})
        status = instance.set_programs(programlist, program_new)
        if status != "success":
            raise ValidationError({'prog': status})

    def update(self, instance: NewUser, validated_data):
        request = self.context.get("request")
        if get_editable_perm(request.user, instance):
            can_create = get_can_add_new_engch_lvl_prg_perm(request.user)
            self.set_groups(instance)
            self.set_level(instance, can_create)
            self.set_engagement_channel(instance, can_create)
            self.set_programs(instance, can_create)
            instance.set_lessons_type(request.POST.get('private_lessons'),
                                      request.POST.get('group_lessons'))
            return super(NewUserDetailSerializer, self).update(instance, validated_data)
        else:
            raise PermissionDenied


class NewUserListSerializer(serializers.ModelSerializer):
    groups = NewUserGroupSerializer(many=True)
    editable = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = NewUser
        fields = ['id', 'first_name', 'last_name',
                  'username', 'groups', 'is_active',
                  'editable']

    def get_editable(self, obj):
        request = self.context.get('request')
        return get_editable_perm(request.user, obj)


class NewUserNameOnlyListSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewUser
        fields = ['id', 'first_name', 'last_name']
