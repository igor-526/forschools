from rest_framework import serializers
from .models import Material, File
from .utils.get_type import get_type
from data_collections.serializers import MaterialLevelSerializer, MaterialCategorySerializer
from profile_management.serializers import NewUserNameOnlyListSerializer


class MaterialSerializer(serializers.ModelSerializer):
    category = MaterialCategorySerializer(many=True, required=False)
    level = MaterialLevelSerializer(many=True, required=False)
    owner = NewUserNameOnlyListSerializer(required=False)

    class Meta:
        model = Material
        fields = ['id', 'name', 'category', 'owner', 'visible', 'file', 'level', 'description', 'type']
        read_only_fields = ['category', 'owner', 'level', 'file']

    def validate_visible(self, value):
        return True

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        textfile = request.POST.get('file_text')
        if textfile:
            file = f"materials/{request.POST.get('name')}.txt"
            with open(f"media/{file}", 'w') as f:
                f.write(textfile)
        else:
            file = request.FILES.get('file')
        material = Material.objects.create(
            owner=user,
            file=file,
            **validated_data
        )
        material.set_category(self.context['request'].data.getlist('cat'))
        material.set_level(self.context['request'].data.getlist('lvl'))
        return material

    def update(self, instance, validated_data):
        request = self.context.get('request')
        instance.set_category(request.data.getlist('cat'))
        instance.set_level(request.data.getlist('lvl'))
        return super(MaterialSerializer, self).update(instance, validated_data)


class MaterialListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id', 'name']


class FileSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = '__all__'

    def get_type(self, obj):
        filetype = get_type(obj.path.path.split('.')[-1])
        return filetype
