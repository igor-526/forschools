

from profile_management.api_v2.serializers import NewUserNameListSerializer

from rest_framework import serializers

from learning_plan.models import LearningPlan


class LearningPlanSerializer(serializers.ModelSerializer):
    teacher = NewUserNameListSerializer(read_only=True)
    listeners = NewUserNameListSerializer(many=True, read_only=True)
    metodist = NewUserNameListSerializer(many=False, read_only=True)
    admin_comment = serializers.SerializerMethodField(read_only=True)
    awaiting_lessons_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LearningPlan
        fields = ['id', 'name', 'listeners',
                  'teacher', 'metodist', 'admin_comment', 'awaiting_lessons_count']

    def to_representation(self, instance: LearningPlan):
        data = super().to_representation(instance)

        request = self.context.get('request')
        if request and request.user.groups.filter(name='Admin').exists():
            data['admin_comment'] = self.get_admin_comment(instance)

        return data

    @staticmethod
    def get_admin_comment(obj):
        return obj.admin_comment

    @staticmethod
    def get_awaiting_lessons_count(obj):
        return obj.awaiting_lessons_count

