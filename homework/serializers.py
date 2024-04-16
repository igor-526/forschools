from rest_framework import serializers
from .models import Homework, HomeworkLog
from lesson.models import Lesson
from profile_management.serializers import NewUserNameOnlyListSerializer
from material.serializers import MaterialListSerializer
from material.serializers import FileSerializer
from tgbot.utils import send_homework_tg, send_homework_answer_tg


class HomeworkSerializer(serializers.ModelSerializer):
    listener = NewUserNameOnlyListSerializer()
    teacher = NewUserNameOnlyListSerializer()
    materials = MaterialListSerializer(many=True)

    class Meta:
        model = Homework
        fields = '__all__'


class HomeworkListSerializer(serializers.ModelSerializer):
    teacher = NewUserNameOnlyListSerializer(many=False, read_only=True)
    listener = NewUserNameOnlyListSerializer(many=False, read_only=True)

    class Meta:
        model = Homework
        fields = ["id", "name", "deadline", "description", "teacher", "listener"]

    def create(self, validated_data):
        lesson_id = self.context.get('request').POST.get('lesson')
        try:
            lesson = Lesson.objects.get(pk=int(lesson_id))
        except Lesson.DoesNotExist:
            raise serializers.ValidationError({"msg": "Урок отсутствует"})
        listeners = lesson.get_listeners()
        homeworks = []
        for listener in listeners:
            homework = Homework.objects.create(**validated_data,
                                               listener=listener,
                                               teacher=lesson.get_teacher())

            send_homework_tg(homework.listener, homework)

            homeworks.append(homework)
        lesson.homeworks.add(*homeworks)
        for homework in homeworks:
            homework.materials.set(self.context.get('request').POST.getlist('materials'))
            homework.save()
        lesson.save()
        return homeworks[0]


class HomeworkLogSerializer(serializers.ModelSerializer):
    user = NewUserNameOnlyListSerializer(many=False, read_only=True)
    files = FileSerializer(many=True, read_only=True)

    class Meta:
        model = HomeworkLog
        fields = ["id", "user", "files", "comment", "status", "homework", "dt"]

    def create(self, validated_data):
        hwl = HomeworkLog.objects.create(**validated_data,
                                         user=self.context.get("user"))
        if len(self.context.get("files")) > 0:
            hwl.files.set(self.context.get("files"))
            hwl.save()
        send_homework_answer_tg(self.context.get("user"), hwl.homework, hwl.status)
        return hwl
