from download_data.models import GenerateFilesTasks

from profile_management.serializers import NewUserNameOnlyListSerializer

from rest_framework import serializers


class GenerateFilesTasksListSerializer(serializers.ModelSerializer):
    initiator = NewUserNameOnlyListSerializer()
    type = serializers.SerializerMethodField(read_only=True)

    def get_type(self, obj):
        if obj.type == 1:
            return "Все планы обучения"
        if obj.type == 2:
            return "Занятия"
        return "Неизвестно"

    class Meta:
        model = GenerateFilesTasks
        fields = '__all__'
