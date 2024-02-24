from rest_framework import serializers
from .models import Lesson, Place
from profile_management.models import NewUser
from material.models import Material
from django.db.models import Q


class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ['name', 'url']


class LessonSerializer(serializers.ModelSerializer):
    teacher = serializers.CharField()
    listener = serializers.CharField()
    newplace_url = serializers.URLField(required=False)
    newplace_name = serializers.CharField(required=False)
    place = PlaceSerializer(required=False)

    class Meta:
        model = Lesson
        exclude = ('materials',)

    def validate(self, data):
        teacher_name = data['teacher'].split(" ")
        teacher = NewUser.objects.filter(first_name=teacher_name[0], last_name=teacher_name[1]).first()
        if not teacher:
            raise serializers.ValidationError({"teacher": "Преподаватель не найден"})
        data['teacher'] = teacher
        listener_name = data['listener'].split(" ")
        listener = NewUser.objects.filter(first_name=listener_name[0], last_name=listener_name[1]).first()
        if not listener:
            raise serializers.ValidationError({"listener": "Ученик не найден"})
        data['listener'] = listener
        newplace_name = data.get("newplace_name")
        newplace_url = data.get("newplace_url")
        if newplace_name and newplace_url:
            newplace_name_try = Place.objects.filter(name=newplace_name).first()
            newplace_url_try = Place.objects.filter(url=newplace_url).first()
            if newplace_name_try:
                raise serializers.ValidationError({"newplace_name": "Такое наименование уже существует"})
            if newplace_url_try:
                raise serializers.ValidationError(
                    {"newplace_url": f"Наименование места для этой ссылки: {newplace_url_try.url}"})
            place = Place.objects.create(name=newplace_name,
                                         url=newplace_url)
            data.pop('newplace_url')
            data.pop('newplace_name')
            data['place'] = place
        else:
            data['place'] = Place.objects.get(name=self.context['request'].data.get('url'))[0]
        return data

    def create(self, validated_data):
        lesson = Lesson.objects.create(**validated_data)
        print(self.context['request'].data)
        return lesson
