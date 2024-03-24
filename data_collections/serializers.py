from rest_framework import serializers
from profile_management.models import Level, Programs, EngagementChannel
from material.models import MaterialCategory, MaterialLevel
from lesson.models import Place


class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = '__all__'


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programs
        fields = '__all__'


class EngagementChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EngagementChannel
        fields = '__all__'


class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = '__all__'


class MaterialCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialCategory
        fields = "__all__"


class MaterialLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialLevel
        fields = "__all__"
