from rest_framework import serializers
from .models import Homework, HomeworkLog
from lesson.models import Lesson
from profile_management.serializers import NewUserNameOnlyListSerializer
from profile_management.models import NewUser
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
    status = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Homework
        fields = ["id", "name", "deadline", "description", "teacher", "listener", "status"]

    def get_status(self, obj):
        return obj.get_status().status

    def create(self, validated_data):
        request = self.context.get("request")
        lesson_id = request.POST.get('lesson')
        if lesson_id:
            try:
                lesson = Lesson.objects.get(pk=int(lesson_id))
                listeners = lesson.get_listeners()
                teacher = lesson.get_hw_teacher()
            except Lesson.DoesNotExist:
                raise serializers.ValidationError({"msg": "Занятие отсутствует"})
        else:
            try:
                lesson = None,
                listeners = NewUser.objects.filter(groups__name="Listener",
                                                   id__in=request.POST.getlist("listeners"))
                if not listeners:
                    raise serializers.ValidationError({"listeners": "Ученики не найдены"})
                teacher = NewUser.objects.get(groups__name="Teacher",
                                              id=request.POST.get("teacher"))
            except NewUser.DoesNotExist:
                raise serializers.ValidationError({"teacher": "Преподаватель не найден"})
        homeworks = []
        for listener in listeners:
            homework = Homework.objects.create(**validated_data,
                                               listener=listener,
                                               teacher=teacher)
            send_homework_tg(homework.listener, homework)
            homeworks.append(homework)
        if lesson_id:
            lesson.homeworks.add(*homeworks)
            lesson.save()
        for homework in homeworks:
            homework.materials.set(self.context.get('request').POST.getlist('materials'))
            homework.save()
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
