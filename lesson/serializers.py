from rest_framework import serializers
from .models import Lesson
from profile_management.serializers import NewUserNameOnlyListSerializer
from material.serializers import MaterialListSerializer
from homework.serializers import HomeworkListSerializer
from data_collections.serializers import PlaceSerializer


class LessonSerializer(serializers.ModelSerializer):
    replace_teacher = NewUserNameOnlyListSerializer(required=False)
    materials = MaterialListSerializer(many=True, required=False)
    homeworks = HomeworkListSerializer(many=True, required=False)
    place = PlaceSerializer()

    class Meta:
        model = Lesson
        fields = "__all__"


class LessonListSerializer(serializers.ModelSerializer):
    place = PlaceSerializer()

    class Meta:
        model = Lesson
        fields = ["id", "name", "start_time", "end_time", "date", "place", "status"]
