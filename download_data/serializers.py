from rest_framework import serializers
from download_data.models import GenerateFilesTasks
from profile_management.serializers import NewUserNameOnlyListSerializer


class GenerateFilesTasksListSerializer(serializers.ModelSerializer):
    initiator = NewUserNameOnlyListSerializer()
    type = serializers.SerializerMethodField(read_only=True)

    def get_type(self, obj):
        if obj.type == 1:
            return "Все планы обучения"
        return "Неизвестно"

    class Meta:
        model = GenerateFilesTasks
        fields = '__all__'
