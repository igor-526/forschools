from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from .models import Lesson, Place, LessonTeacherReview
from profile_management.serializers import NewUserNameOnlyListSerializer
from material.serializers import MaterialListSerializer
from homework.serializers import HomeworkListSerializer
from data_collections.serializers import PlaceSerializer
from learning_plan.models import LearningPhases
from learning_plan.permissions import can_edit_plan
from .permissions import can_set_not_held, can_set_passed


class LessonTeacherReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonTeacherReview
        fields = "__all__"


class LessonSerializer(serializers.ModelSerializer):
    replace_teacher = NewUserNameOnlyListSerializer(required=False)
    materials = MaterialListSerializer(many=True, required=False)
    homeworks = HomeworkListSerializer(many=True, required=False)
    lesson_teacher_review = serializers.SerializerMethodField(read_only=True)
    place = PlaceSerializer()
    deletable = serializers.SerializerMethodField(read_only=True)
    can_set_not_held = serializers.SerializerMethodField(read_only=True)
    learning_plan = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lesson
        fields = "__all__"

    def get_learning_plan(self, obj):
        plan = obj.get_learning_plan()
        if plan:
            return {"id": plan.id,
                    "name": plan.name,
                    "teacher": NewUserNameOnlyListSerializer(plan.teacher, many=False).data,
                    "listeners": NewUserNameOnlyListSerializer(plan.listeners.all(), many=True).data,
                    "curators": NewUserNameOnlyListSerializer(plan.curators.all(), many=True).data,
                    "methodist": NewUserNameOnlyListSerializer(plan.metodist, many=False).data}
        else:
            return None

    def get_lesson_teacher_review(self, obj):
        request = self.context.get("request")
        if request and request.user.groups.filter(name__in=["Admin", "Metodist", "Teacher"]).exists():
            return LessonTeacherReviewSerializer(obj.lesson_teacher_review, many=False).data \
                if obj.lesson_teacher_review else None
        else:
            return None

    def get_deletable(self, obj):
        return obj.status == 0

    def get_can_set_not_held(self, obj):
        return can_set_not_held(self.context.get('request'), obj)

    def update(self, instance, validated_data):
        place = self.context.get('request').POST.get("place")
        if place:
            instance.place = Place.objects.get(pk=place)
            instance.save()
        return super(LessonSerializer, self).update(instance, validated_data)

    def destroy(self, instance):
        if instance.status == 0:
            if can_edit_plan(self.context.get('request'),
                             instance.get_learning_plan()):
                return True
        else:
            raise PermissionDenied()


class LessonListSerializer(serializers.ModelSerializer):
    place = PlaceSerializer(required=False)
    deletable = serializers.SerializerMethodField(read_only=True)
    can_set_not_held = serializers.SerializerMethodField(read_only=True)
    teacher = serializers.SerializerMethodField(read_only=True)
    listeners = serializers.SerializerMethodField(read_only=True)
    hw_data = serializers.SerializerMethodField(read_only=True)
    awaiting_action = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lesson
        exclude = ['materials', 'homeworks']

    def get_awaiting_action(self, obj):
        return can_set_passed(self.context.get('request'), obj)

    def get_hw_data(self, obj):
        def get_color():
            if len(all_hws_statuses) == 0:
                return "primary"
            all_accepted = [hw.status for hw in all_hws_statuses].count(4) == len(all_hws_statuses)
            if all_accepted:
                return 'success'
            not_log_accepted = list(filter(lambda s: s.agreement.get("accepted") is False, all_hws_statuses))
            if not_log_accepted:
                return "warning"
            return "primary"

        all_hws_statuses = [hw.get_status() for hw in obj.homeworks.exclude(log_set__status=6)]
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

    def get_can_set_not_held(self, obj):
        return can_set_not_held(self.context.get('request'), obj)

    def create(self, validated_data):
        lesson = Lesson.objects.create(**validated_data)
        place = self.context.get('request').POST.get("place")
        if place:
            lesson.place = Place.objects.get(pk=place)
            lesson.save()
        phase = LearningPhases.objects.get(pk=self.context.get('phase_pk'))
        phase.lessons.add(lesson)
        return lesson
