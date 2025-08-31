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