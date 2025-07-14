import os.path

from data_collections.serializers import (MaterialCategorySerializer,
                                          MaterialLevelSerializer)

from profile_management.serializers import NewUserNameOnlyListSerializer

from rest_framework import serializers

from tgbot.utils import sync_funcs

from .models import File, Material
from .utils import get_type_by_ext


class MaterialSerializer(serializers.ModelSerializer):
    category = MaterialCategorySerializer(many=True, required=False)
    level = MaterialLevelSerializer(many=True, required=False)
    owner = NewUserNameOnlyListSerializer(required=False)
    file = serializers.SerializerMethodField()
    file_type = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = ['id', 'name', 'category', 'owner', 'visible',
                  'file', 'level', 'description', 'type', 'file_type']
        read_only_fields = ['category', 'owner', 'level',
                            'file', 'file_type']

    def validate_visible(self, value):
        return True

    def get_file(self, obj):
        if not os.path.exists(obj.file.path):
            if not obj.tg_url:
                return None
            new_url = sync_funcs.restore_file(obj.tg_url, obj.extension)
            obj.file = new_url
            obj.save()
        return obj.file.url

    def get_file_type(self, obj):
        filetype = get_type_by_ext(obj.extension)
        return filetype

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        textfile = request.POST.get('file_text')
        if textfile:
            file = f"materials/{request.POST.get('name')}.txt"
            with open(f"media/{file}", 'w', encoding="utf-16") as f:
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
        return super(MaterialSerializer, self).update(instance,
                                                      validated_data)


class MaterialListSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = ['id', 'name', 'file', 'type']

    def get_file(self, obj):
        if not os.path.exists(obj.file.path):
            if not obj.tg_url:
                return None
            new_url = sync_funcs.restore_file(obj.tg_url, obj.extension)
            obj.file = new_url
            obj.save()
        return obj.file.url

    def get_type(self, obj):
        filetype = get_type_by_ext(obj.extension)
        return filetype


class FileSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    path = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = '__all__'

    def get_path(self, obj: File):
        if not os.path.exists(obj.path.path):
            if not obj.tg_url:
                return None
            new_url = sync_funcs.restore_file(obj.tg_url, obj.extension)
            obj.path = new_url
            obj.save()
        return obj.path.url

    def get_type(self, obj: File):
        if not obj.extension:
            ext = obj.path.path.split('.')[-1]
            obj.extension = ext
            obj.save()
        filetype = get_type_by_ext(obj.extension)
        return filetype


class MaterialLogSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    path = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = ['type', 'path']

    def get_path(self, obj):
        if not os.path.exists(obj.file.path):
            if not obj.tg_url:
                return None
            new_url = sync_funcs.restore_file(obj.tg_url, obj.extension)
            obj.file = new_url
            obj.save()
        return obj.file.url

    def get_type(self, obj):
        return get_type_by_ext(obj.extension)


class FileLogSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    path = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['type', 'path']

    def get_path(self, obj):
        if not os.path.exists(obj.path.path):
            if not obj.tg_url:
                return None
            new_url = sync_funcs.restore_file(obj.tg_url, obj.extension)
            obj.path = new_url
            obj.save()
        return obj.path.url

    def get_type(self, obj):
        return get_type_by_ext(obj.extension)
