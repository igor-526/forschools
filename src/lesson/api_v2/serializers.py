from datetime import datetime

from rest_framework import serializers

from lesson.models import Lesson, Place, LessonTeacherReview
from profile_management.api_v2.serializers import NewUserNameListSerializer


class LessonPlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = '__all__'


class LessonPlaceNameOnlySerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ["id", "name"]


class LessonMainInfoSerializer(serializers.ModelSerializer):
    dt = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ["id", "name", "dt"]

    @staticmethod
    def get_dt(obj: Lesson):
        date_str = obj.date.strftime("%d.%m.%Y" if obj.date.year != datetime.now().year else "%d.%m")
        time_str = f'{obj.start_time.strftime("%H:%M")} - {obj.end_time.strftime("%H:%M")}'
        return f'{date_str} {time_str}'


class LessonListSerializer(serializers.ModelSerializer):
    teacher = NewUserNameListSerializer()
    listeners = NewUserNameListSerializer(many=True)
    dt = serializers.SerializerMethodField()
    hw = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    place = LessonPlaceSerializer()

    request_user_roles = []

    class Meta:
        model = Lesson
        fields = ["id", "name", "dt", "place", "status",
                  "teacher", "listeners", "hw", "admin_comment",
                  "date", "start_dt", "end_dt"]

    def __init__(self, *args, **kwargs):
        super(LessonListSerializer, self).__init__(*args, **kwargs)
        self.request_user_roles = self.context.get('request').user.roles

    def get_admin_comment(self, obj: Lesson):
        if "Admin" in self.request_user_roles:
            return obj.admin_comment
        return None

    @staticmethod
    def get_dt(obj: Lesson):
        date_str = obj.date.strftime("%d.%m.%Y" if obj.date.year != datetime.now().year else "%d.%m")
        time_str = f'{obj.start_time.strftime("%H:%M")} - {obj.end_time.strftime("%H:%M")}'
        return f'{date_str} {time_str}'

    @staticmethod
    def get_hw(obj: Lesson):
        return {"count": obj.hw_count}

    def get_status(self, obj: Lesson):
        if obj.status in [1, 2]:
            return obj.status
        if (obj.date <= datetime.now().date() and
                ("Admin" in self.request_user_roles or
                 self.context.get("request").user == obj.teacher)):
            return 3
        return 0


class LessonTeacherReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonTeacherReview
        fields = "__all__"


class LessonDetailSerializer(serializers.ModelSerializer):
    replace_teacher = NewUserNameListSerializer()
    # actions = serializers.SerializerMethodField()
    additional_listeners = NewUserNameListSerializer(many=True)
    # homeworks = serializers.SerializerMethodField()
    lesson_teacher_review = serializers.SerializerMethodField(read_only=True)
    place = LessonPlaceSerializer()
    # learning_plan = serializers.SerializerMethodField(read_only=True)
    # awaiting_action = serializers.SerializerMethodField(read_only=True)

    user_groups = []
    plan = None

    class Meta:
        model = Lesson
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super(LessonDetailSerializer, self).__init__(*args, **kwargs)
        self.user_groups = (self.context.get('request').user
                            .groups.values_list('name', flat=True))
        self.plan = args[0].get_learning_plan()

    # def get_actions(self, obj) -> list[str]:
    #     actions = []
    #     if lesson_perm_can_set_replace(lesson=obj,
    #                                    user_groups=self.user_groups):
    #         actions.append("replace_teacher")
    #         actions.append("add_listeners")
    #     if lesson_perm_can_edit(lesson=obj,
    #                             user_groups=self.user_groups):
    #         actions.append("edit")
    #     if lesson_perm_can_set_not_held(lesson=obj,
    #                                     user_groups=self.user_groups):
    #         actions.append("set_not_held")
    #     if lesson_perm_can_delete(lesson=obj,
    #                               user_groups=self.user_groups):
    #         actions.append("delete")
    #     if lesson_perm_can_add_homework(user=self.context.get('request').user,
    #                                     lesson=obj,
    #                                     plan=self.plan,
    #                                     user_groups=self.user_groups):
    #         actions.append("add_homework")
    #     return actions

    # def get_homeworks(self, obj) -> list[dict[str, Any]]:
    #     queryset = obj.homeworks.exclude(log_set__status=6)
    #     return HomeworkListSerializer(
    #         queryset,
    #         many=True,
    #         context={"request": self.context.get("request")}
    #     ).data

    # def get_learning_plan(self, obj) -> dict[str, str] | None:
    #     if self.plan:
    #         return {
    #             "id": self.plan.id,
    #             "name": self.plan.name,
    #             "teacher": NewUserNameOnlyListSerializer(self.plan.teacher,
    #                                                      many=False).data,
    #             "listeners": NewUserNameOnlyListSerializer(
    #                 self.plan.listeners.all(),
    #                 many=True
    #             ).data,
    #             "curators": NewUserNameOnlyListSerializer(
    #                 self.plan.curators.all(),
    #                 many=True
    #             ).data,
    #             "methodist": NewUserNameOnlyListSerializer(
    #                 self.plan.metodist,
    #                 many=False
    #             ).data
    #         }
    #     else:
    #         return None

    def get_lesson_teacher_review(self, obj) -> dict[str, str] | None:
        request = self.context.get("request")
        if request and request.user.groups.filter(
                name__in=["Admin", "Metodist", "Teacher"]
        ).exists():
            return LessonTeacherReviewSerializer(obj.lesson_teacher_review,
                                                 many=False).data \
                if obj.lesson_teacher_review else None
        else:
            return None
