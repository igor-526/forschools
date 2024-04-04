from rest_framework import serializers
from .models import Lesson
from profile_management.serializers import NewUserNameOnlyListSerializer
from material.serializers import MaterialListSerializer
from homework.serializers import HomeworkListSerializer
from data_collections.serializers import PlaceSerializer
from lesson.models import Place
from learning_plan.models import LearningPhases


class LessonSerializer(serializers.ModelSerializer):
    replace_teacher = NewUserNameOnlyListSerializer(required=False)
    materials = MaterialListSerializer(many=True, required=False)
    homeworks = HomeworkListSerializer(many=True, required=False)
    place = PlaceSerializer()

    class Meta:
        model = Lesson
        fields = "__all__"


class LessonListSerializer(serializers.ModelSerializer):
    place = PlaceSerializer(required=False)

    class Meta:
        model = Lesson
        exclude = ['materials', 'homeworks', 'evaluation', 'note_teacher', 'note_listener']

    def create(self, validated_data):
        lesson = Lesson.objects.create(**validated_data)
        place = self.context.get('request').POST.get("place")
        if place:
            lesson.place = Place.objects.get(pk=place)
            lesson.save()
        phase = LearningPhases.objects.get(pk=self.context.get('phase_pk'))
        phase.lessons.add(lesson)
        return lesson
