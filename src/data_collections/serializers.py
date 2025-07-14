from lesson.models import Place

from material.models import MaterialCategory, MaterialLevel

from profile_management.models import EngagementChannel, Level

from rest_framework import serializers


class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
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
