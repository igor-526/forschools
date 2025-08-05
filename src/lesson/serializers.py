from typing import Any, Dict, List

from data_collections.serializers import PlaceSerializer

from homework.serializers import HomeworkListSerializer

from learning_plan.models import LearningPhases, LearningPlan

from material.serializers import MaterialListSerializer

from profile_management.serializers import NewUserNameOnlyListSerializer

from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from .models import Lesson, LessonTeacherReview, Place
from .permissions import (can_set_passed,
                          lesson_perm_can_add_homework,
                          lesson_perm_can_delete,
                          lesson_perm_can_edit,
                          lesson_perm_can_set_not_held,
                          lesson_perm_can_set_replace)


class LessonTeacherReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonTeacherReview
        fields = "__all__"


class LessonSerializer(serializers.ModelSerializer):
    replace_teacher = NewUserNameOnlyListSerializer(required=False)
    actions = serializers.SerializerMethodField()
    additional_listeners = NewUserNameOnlyListSerializer(required=False,
                                                         many=True)
    materials = MaterialListSerializer(many=True, required=False)
    homeworks = serializers.SerializerMethodField(read_only=True)
    lesson_teacher_review = serializers.SerializerMethodField(read_only=True)
    place = PlaceSerializer()
    learning_plan = serializers.SerializerMethodField(read_only=True)
    awaiting_action = serializers.SerializerMethodField(read_only=True)

    user_groups: List[str] = []
    plan: LearningPlan = None

    class Meta:
        model = Lesson
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super(LessonSerializer, self).__init__(*args, **kwargs)
        self.user_groups = (self.context.get('request').user
                            .groups.values_list('name', flat=True))
        self.plan = args[0].get_learning_plan()

    def get_actions(self, obj) -> List[str]:
        actions = []
        if lesson_perm_can_set_replace(lesson=obj,
                                       user_groups=self.user_groups):
            actions.append("replace_teacher")
            actions.append("add_listeners")
        if lesson_perm_can_edit(lesson=obj,
                                user_groups=self.user_groups):
            actions.append("edit")
        if lesson_perm_can_set_not_held(lesson=obj,
                                        user_groups=self.user_groups):
            actions.append("set_not_held")
        if lesson_perm_can_delete(lesson=obj,
                                  user_groups=self.user_groups):
            actions.append("delete")
        if lesson_perm_can_add_homework(user=self.context.get('request').user,
                                        lesson=obj,
                                        plan=self.plan,
                                        user_groups=self.user_groups):
            actions.append("add_homework")
        return actions

    def get_homeworks(self, obj) -> List[Dict[str, Any]]:
        queryset = obj.homeworks.exclude(log_set__status=6)
        return HomeworkListSerializer(
            queryset,
            many=True,
            context={"request": self.context.get("request")}
        ).data

    def get_learning_plan(self, obj) -> Dict[str, str] | None:
        if self.plan:
            return {
                "id": self.plan.id,
                "name": self.plan.name,
                "teacher": NewUserNameOnlyListSerializer(self.plan.teacher,
                                                         many=False).data,
                "listeners": NewUserNameOnlyListSerializer(
                    self.plan.listeners.all(),
                    many=True
                ).data,
                "curators": NewUserNameOnlyListSerializer(
                    self.plan.curators.all(),
                    many=True
                ).data,
                "methodist": NewUserNameOnlyListSerializer(
                    self.plan.metodist,
                    many=False
                ).data
            }
        else:
            return None

    def get_lesson_teacher_review(self, obj) -> Dict[str, str] | None:
        request = self.context.get("request")
        if request and request.user.groups.filter(
                name__in=["Admin", "Metodist", "Teacher"]
        ).exists():
            return LessonTeacherReviewSerializer(obj.lesson_teacher_review,
                                                 many=False).data \
                if obj.lesson_teacher_review else None
        else:
            return None

    def get_awaiting_action(self, obj) -> str | bool:
        can_set_passed_ = can_set_passed(
            self.context.get('request'), obj
        )
        if not can_set_passed_:
            return False

        if ((can_set_passed_ and
             self.plan and
             self.plan.can_report_lesson_name_only) or
                (can_set_passed_ and
                 self.context.get(
                     'request'
                 ).user.groups.filter(name="Admin").exists())):
            return "name_only"
        if can_set_passed_:
            return "full"
        return False

    def update(self, instance, validated_data):
        place = self.context.get('request').POST.get("place")
        if place:
            instance.place = Place.objects.get(pk=place)
            instance.save()
        return super(LessonSerializer, self).update(instance,
                                                    validated_data)

    def destroy(self, instance):
        if not lesson_perm_can_delete(
                lesson=instance,
                user_groups=self.user_groups
        ):
            raise PermissionDenied()
        instance.delete()
        return True


class LessonListSerializer(serializers.ModelSerializer):
    place = PlaceSerializer(required=False)
    deletable = serializers.SerializerMethodField(read_only=True)
    teacher = serializers.SerializerMethodField(read_only=True)
    listeners = serializers.SerializerMethodField(read_only=True)
    hw_data = serializers.SerializerMethodField(read_only=True)
    awaiting_action = serializers.SerializerMethodField(read_only=True)
    admin_comment = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lesson
        exclude = ['materials', 'homeworks', 'additional_listeners']

    def get_awaiting_action(self, obj):
        return can_set_passed(self.context.get('request'), obj)

    def get_hw_data(self, obj):
        def get_color():
            if len(all_hws_statuses) == 0:
                return "primary"
            all_accepted = [
                               hw.status for hw in all_hws_statuses
                           ].count(4) == len(all_hws_statuses)
            if all_accepted:
                return 'success'
            not_log_accepted = list(filter(
                lambda s: s.agreement.get("accepted") is False,
                all_hws_statuses
            ))
            if not_log_accepted:
                return "warning"
            return "primary"

        all_hws_statuses = [
            hw.get_status() for hw in
            obj.homeworks.exclude(log_set__status=6)
        ]
        return {"count": len(all_hws_statuses),
                "color": get_color()}

    def get_teacher(self, obj):
        teacher = obj.get_teacher()
        return NewUserNameOnlyListSerializer(teacher, many=False).data

    def get_listeners(self, obj):
        listeners = obj.get_listeners()
        return NewUserNameOnlyListSerializer(listeners, many=True).data

    def get_deletable(self, obj):
        return obj.status == 0

    def get_admin_comment(self, obj):
        request = self.context.get("request")
        if request.user.groups.filter(name="Admin").exists():
            return obj.admin_comment
        else:
            return None

    def create(self, validated_data):
        lesson = Lesson.objects.create(**validated_data)
        place = self.context.get('request').POST.get("place")
        if place:
            lesson.place = Place.objects.get(pk=place)
            lesson.save()
        phase = LearningPhases.objects.get(pk=self.context.get('phase_pk'))
        phase.lessons.add(lesson)
        return lesson


class LessonListForPhaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lesson
        fields = ['id', 'name', 'date', 'start_time', 'end_time', 'status']
