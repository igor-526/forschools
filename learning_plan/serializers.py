from django.utils import timezone

from rest_framework import serializers
from .models import LearningPlan, LearningPhases
from profile_management.serializers import NewUserNameOnlyListSerializer
from profile_management.models import NewUser
from lesson.serializers import LessonListSerializer


class LearningPlanListSerializer(serializers.ModelSerializer):
    teacher = NewUserNameOnlyListSerializer(read_only=True)
    listeners = NewUserNameOnlyListSerializer(many=True, read_only=True)

    class Meta:
        model = LearningPlan
        fields = ['id', 'name', 'listeners', 'teacher', 'purpose', 'deadline']

    def validate_deadline(self, value):
        if value and value <= timezone.now():
            raise serializers.ValidationError("Срок плана не может быть раньше сегодняшнего дня")
        return value

    def create(self, validated_data):
        request = self.context.get('request')

        req_teacher = request.POST.get('teacher')
        if req_teacher == "":
            raise serializers.ValidationError({"teacher": "Поле не может быть пустым"})
        try:
            teacher = NewUser.objects.get(groups__name="Teacher",
                                          first_name=req_teacher.split(" ")[0],
                                          last_name=req_teacher.split(" ")[1])
            validated_data['teacher'] = teacher
        except Exception:
            raise serializers.ValidationError({"teacher": "Преподаватель не найден"})
        listeners = request.POST.getlist('listeners')
        plan_obj = LearningPlan.objects.create(**validated_data)
        plan_obj.listeners.set(listeners)
        return plan_obj


class LearningPhasesListSerializer(serializers.ModelSerializer):
    lessons = LessonListSerializer(required=False, many=True)

    class Meta:
        model = LearningPhases
        fields = ['id', 'name', 'purpose', 'status', 'lessons']

    def validate_name(self, value):
        non_unique = LearningPlan.objects.get(pk=self.context.get('plan_pk')).phases.filter(name=value).first()
        if non_unique and non_unique != self.instance:
            raise serializers.ValidationError("Данный этап уже существует")
        return value

    def create(self, validated_data):
        phase = LearningPhases.objects.create(**validated_data)
        plan = LearningPlan.objects.get(pk=self.context.get('plan_pk'))
        plan.phases.add(phase)
        plan.save()
        return phase
