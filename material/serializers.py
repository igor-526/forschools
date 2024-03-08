from rest_framework import serializers
from .models import Material, File, MaterialCategory
from profile_management.models import NewUser


class MaterialCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialCategory
        fields = "__all__"


class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewUser
        fields = ['last_name', 'first_name']


class MaterialSerializer(serializers.ModelSerializer):
    category = MaterialCategorySerializer(many=True, required=False)
    owner = OwnerSerializer(required=False)

    class Meta:
        model = Material
        fields = "__all__"
        read_only_fields = ['category', 'owner']

    def create(self, validated_data):
        user = self.context['request'].user
        material = Material.objects.create(
            owner=user,
            **validated_data
        )
        material.set_category(self.context['request'].data.getlist('cat'))
        return material
