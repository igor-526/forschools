from django.utils import timezone

from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from .models import LearningPlan, LearningPhases
from profile_management.serializers import NewUserNameOnlyListSerializer
from profile_management.models import NewUser
from lesson.serializers import LessonListSerializer


class LearningPlanListSerializer(serializers.ModelSerializer):
    teacher = NewUserNameOnlyListSerializer(read_only=True)
    default_hw_teacher = NewUserNameOnlyListSerializer(read_only=True)
    listeners = NewUserNameOnlyListSerializer(many=True, read_only=True)
    deletable = serializers.SerializerMethodField(read_only=False)

    class Meta:
        model = LearningPlan
        fields = ['id', 'name', 'listeners',
                  'teacher', 'purpose', 'deadline',
                  'show_lessons', 'show_materials',
                  'default_hw_teacher', 'deletable']

    def get_deletable(self, obj):
        return obj.phases.count() == 0

    def validate_deadline(self, value):
        if value and value <= timezone.now().date():
            raise serializers.ValidationError("Срок плана не может быть раньше сегодняшнего дня")
        return value

    def validate_teacher(self, request, usergroups):
        req_teacher = request.POST.get('teacher')
        if ("Admin" in usergroups) or ("Metodist" in usergroups):
            if req_teacher == "":
                raise serializers.ValidationError({"teacher": "Поле не может быть пустым"})
            try:
                teacher = NewUser.objects.get(groups__name="Teacher",
                                              pk=req_teacher)
                return teacher
            except Exception:
                raise serializers.ValidationError({"teacher": "Преподаватель не найден"})
        if "Teacher" in usergroups:
            return request.user
        if "Listener" in usergroups:
            raise PermissionDenied("Вы не можете добалять планы обучения")

    def validate_default_hw_teacher(self, request, usergroups):
        req_teacher_hw = request.POST.get('default_hw_teacher')
        if ("Admin" in usergroups) or ("Metodist" in usergroups):
            if req_teacher_hw == "":
                return self.validate_teacher(request, usergroups)
            try:
                teacher = NewUser.objects.get(groups__name="Teacher",
                                              pk=req_teacher_hw)
                return teacher
            except Exception:
                raise serializers.ValidationError({"default_hw_teacher": "Преподаватель не найден"})
        if "Teacher" in usergroups:
            return request.user
        if "Listener" in usergroups:
            raise PermissionDenied("Вы не можете добалять планы обучения")

    def create(self, validated_data):
        request = self.context.get('request')
        usergroups = [group.name for group in request.user.groups.all()]
        validated_data['teacher'] = self.validate_teacher(request, usergroups)
        validated_data['default_hw_teacher'] = self.validate_default_hw_teacher(request, usergroups)
        listeners = request.POST.getlist('listeners')
        plan_obj = LearningPlan.objects.create(**validated_data)
        plan_obj.listeners.set(listeners)
        return plan_obj

    def update(self, instance, validated_data):
        request = self.context.get('request')
        usergroups = [group.name for group in request.user.groups.all()]
        validated_data['teacher'] = self.validate_teacher(request, usergroups)
        validated_data['default_hw_teacher'] = self.validate_default_hw_teacher(request, usergroups)
        listeners = request.POST.getlist('listeners')
        instance.listeners.set(listeners)
        instance.save()
        return super(LearningPlanListSerializer, self).update(instance, validated_data)

    def destroy(self, instance):
        if self.get_deletable(instance):
            instance.delete()
            return True
        else:
            raise PermissionDenied()


class LearningPhasesListSerializer(serializers.ModelSerializer):
    lessons = LessonListSerializer(required=False, many=True)
    deletable = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LearningPhases
        fields = ['id', 'name', 'purpose', 'status', 'lessons', 'deletable']

    def get_deletable(self, obj):
        return obj.lessons.count() == 0

    def validate_name(self, value):
        non_unique = self.context.get('plan').phases.filter(name=value).first()
        if non_unique and non_unique != self.instance:
            raise serializers.ValidationError("Данный этап уже существует")
        return value

    def create(self, validated_data):
        phase = LearningPhases.objects.create(**validated_data)
        plan = self.context.get('plan')
        plan.phases.add(phase)
        plan.save()
        return phase
