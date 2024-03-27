from rest_framework import serializers
from .models import Homework, HomeworkLog
from profile_management.serializers import NewUserNameOnlyListSerializer
from material.serializers import MaterialListSerializer


class HomeworkSerializer(serializers.ModelSerializer):
    listener = NewUserNameOnlyListSerializer()
    teacher = NewUserNameOnlyListSerializer()
    materials = MaterialListSerializer(many=True)

    class Meta:
        model = Homework
        fields = '__all__'


class HomeworkListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Homework
        fields = ["id", "name", "deadline"]
