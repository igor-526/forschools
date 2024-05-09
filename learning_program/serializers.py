from .models import LearningProgram, LearningProgramPhase, LearningProgramLesson, LearningProgramHomework
from material.serializers import MaterialListSerializer
from profile_management.serializers import NewUserNameOnlyListSerializer
from rest_framework import serializers


class LearningProgramHomeworkSerializer(serializers.ModelSerializer):
    materials = MaterialListSerializer(read_only=True, many=True)

    class Meta:
        model = LearningProgramHomework
        fields = '__all__'

    def create(self, validated_data):
        hw = LearningProgramHomework.objects.create(**validated_data)
        request = self.context.get("request")
        materials = request.POST.getlist('materials')
        hw.materials.set(materials)
        hw.save()
        return hw

    def update(self, instance, validated_data):
        request = self.context.get("request")
        materials = request.POST.getlist('materials')
        instance.materials.set(materials)
        instance.save()
        return super(LearningProgramHomeworkSerializer, self).update(instance, validated_data)


class LearningProgramLessonSerializer(serializers.ModelSerializer):
    materials = MaterialListSerializer(read_only=True, many=True)
    homeworks = LearningProgramHomeworkSerializer(many=True, read_only=True)

    class Meta:
        model = LearningProgramLesson
        fields = '__all__'

    def create(self, validated_data):
        lesson = LearningProgramLesson.objects.create(**validated_data)
        request = self.context.get("request")
        materials = request.POST.getlist('materials')
        lesson.materials.set(materials)
        lesson.save()
        return lesson

    def update(self, instance, validated_data):
        request = self.context.get("request")
        materials = request.POST.getlist('materials')
        instance.materials.set(materials)
        instance.save()
        return super(LearningProgramLessonSerializer, self).update(instance, validated_data)


class LearningProgramPhaseSerializer(serializers.ModelSerializer):
    lessons = LearningProgramLessonSerializer(many=True, read_only=True)
    owner = NewUserNameOnlyListSerializer(read_only=True)

    class Meta:
        model = LearningProgramPhase
        fields = '__all__'

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data.pop("visibility")
        validated_data.pop('lessons_order')
        lessons = request.POST.getlist('lessons_order')
        phase = LearningProgramPhase.objects.create(**validated_data,
                                                    owner=request.user,
                                                    visibility=True,
                                                    lessons_order=list(lessons))
        if lessons:
            phase.lessons.set(lessons)
            phase.save()
        return phase

    def update(self, instance, validated_data):
        request = self.context.get("request")
        lessons = request.POST.getlist('lessons_order')
        validated_data['lessons_order'] = list(lessons)
        instance.lessons.set(lessons)
        instance.save()
        return super(LearningProgramPhaseSerializer, self).update(instance, validated_data)


class LearningProgramSerializer(serializers.ModelSerializer):
    phases = LearningProgramPhaseSerializer(many=True, read_only=True)
    owner = NewUserNameOnlyListSerializer(many=False, read_only=True)

    class Meta:
        model = LearningProgram
        fields = '__all__'

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data.pop("visibility")
        validated_data.pop("phases_order")
        phases = request.POST.getlist('phases_order')
        program = LearningProgram.objects.create(**validated_data,
                                                 owner=request.user,
                                                 visibility=True,
                                                 phases_order=list(phases))
        if phases:
            program.phases.set(phases)
            program.save()
        return program

    def update(self, instance, validated_data):
        request = self.context.get("request")
        phases = request.POST.getlist('phases_order')
        validated_data['phases_order'] = list(phases)
        instance.phases.set(phases)
        instance.save()
        return super(LearningProgramSerializer, self).update(instance, validated_data)
