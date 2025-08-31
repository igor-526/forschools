from django.db.models import Q
from rest_framework import serializers

from lesson.api_v2.serializers import LessonMainInfoSerializer
from profile_management.api_v2.serializers import NewUserNameListSerializer
from homework.models import Homework, HomeworkLog


class HomeworksLogMainInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeworkLog
        fields = ["status", "dt", "agreement"]


class HomeworkListSerializer(serializers.ModelSerializer):
    teacher = NewUserNameListSerializer(many=False)
    listener = NewUserNameListSerializer(many=False)
    last_status = serializers.SerializerMethodField(read_only=True)
    lesson_info = serializers.SerializerMethodField(read_only=True)
    assigned_status = serializers.SerializerMethodField(read_only=True)
    admin_comment = serializers.SerializerMethodField(read_only=True)

    user_roles: list[str] = []

    class Meta:
        model = Homework
        fields = ["id", "name", "description", "teacher",
                  "for_curator", "listener", "last_status", "lesson_info",
                  "assigned_status", "admin_comment"]

    def __init__(self, *args, **kwargs):
        super(HomeworkListSerializer, self).__init__(*args, **kwargs)
        self.user_roles = self.context.get('request').user.roles

    @staticmethod
    def get_last_status(obj: Homework):
        return {"dt": obj.last_log_dt, "status": obj.last_log_status}

    @staticmethod
    def get_assigned_status(obj: Homework):
        return {"dt": obj.assigned_log_dt}

    @staticmethod
    def get_lesson_info(obj: Homework):
        if hasattr(obj, 'first_lesson') and obj.first_lesson:
            first_lesson = obj.first_lesson[0] if obj.first_lesson else None
            if first_lesson:
                return LessonMainInfoSerializer(first_lesson).data
        return None


    def get_admin_comment(self, obj: Homework):
        if "Admin" in self.user_roles:
            return obj.admin_comment
        return None
