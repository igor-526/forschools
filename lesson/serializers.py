from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from .models import Lesson
from profile_management.serializers import NewUserNameOnlyListSerializer
from material.serializers import MaterialListSerializer
from homework.serializers import HomeworkListSerializer
from data_collections.serializers import PlaceSerializer
from lesson.models import Place
from learning_plan.models import LearningPhases
from learning_plan.permissions import can_edit_plan
from .permissions import can_set_not_held


class LessonSerializer(serializers.ModelSerializer):
    replace_teacher = NewUserNameOnlyListSerializer(required=False)
    materials = MaterialListSerializer(many=True, required=False)
    homeworks = HomeworkListSerializer(many=True, required=False)
    place = PlaceSerializer()
    deletable = serializers.SerializerMethodField(read_only=True)
    can_set_not_held = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lesson
        fields = "__all__"

    def get_deletable(self, obj):
        return obj.status == 0

    def get_can_set_not_held(self, obj):
        return can_set_not_held(self.context.get('request'), obj)

    def update(self, instance, validated_data):
        place = self.context.get('request').POST.get("place")
        if place:
            instance.place = Place.objects.get(pk=place)
            instance.save()
        return super(LessonSerializer, self).update(instance, validated_data)

    def destroy(self, instance):
        if instance.status == 0:
            if can_edit_plan(self.context.get('request'),
                             instance.get_learning_plan()):
                return True
        else:
            raise PermissionDenied()


class LessonListSerializer(serializers.ModelSerializer):
    place = PlaceSerializer(required=False)
    deletable = serializers.SerializerMethodField(read_only=True)
    can_set_not_held = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lesson
        exclude = ['materials', 'homeworks', 'evaluation', 'note_teacher', 'note_listener']

    def get_deletable(self, obj):
        return obj.status == 0

    def get_can_set_not_held(self, obj):
        return can_set_not_held(self.context.get('request'), obj)

    def create(self, validated_data):
        lesson = Lesson.objects.create(**validated_data)
        place = self.context.get('request').POST.get("place")
        if place:
            lesson.place = Place.objects.get(pk=place)
            lesson.save()
        phase = LearningPhases.objects.get(pk=self.context.get('phase_pk'))
        phase.lessons.add(lesson)
        return lesson
