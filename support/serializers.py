from pprint import pprint
from profile_management.serializers import NewUserNameOnlyListSerializer
from rest_framework import serializers
from .models import WSGIErrorsLog, SupportTicketAnswers, SupportTicket
from material.serializers import FileSerializer
from dls.settings import MATERIAL_FORMATS
from material.models import File


class WSGIErrorsLogListSerializer(serializers.ModelSerializer):
    user = NewUserNameOnlyListSerializer(required=False, many=False)

    class Meta:
        model = WSGIErrorsLog
        fields = ["id", "user", "dt", "path_info", "method",
                  "status_code", "handling_status"]


class WSGIErrorsLogSerializer(serializers.ModelSerializer):
    user = NewUserNameOnlyListSerializer(required=False, many=False)

    class Meta:
        model = WSGIErrorsLog
        fields = "__all__"


class SupportTicketAnswersSerializer(serializers.ModelSerializer):
    user = NewUserNameOnlyListSerializer(required=False, many=False)
    read_by = NewUserNameOnlyListSerializer(required=False, many=True)

    class Meta:
        model = SupportTicketAnswers
        fields = "__all__"


class SupportTicketListSerializer(serializers.ModelSerializer):
    user = NewUserNameOnlyListSerializer(required=False, many=False, read_only=True)
    attachments = FileSerializer(required=False, many=True, read_only=True)
    status = serializers.SerializerMethodField(required=False, read_only=True)

    class Meta:
        model = SupportTicket
        exclude = ["answers"]

    def get_status(self, obj):
        return obj.get_status()

    def validate(self, data):
        attachments = self.context.get("request").FILES.getlist("attachments")
        for attachment in attachments:
            file_format = attachment.name.split(".")[-1]
            if file_format not in MATERIAL_FORMATS.get("image_formats") \
                    and file_format not in MATERIAL_FORMATS.get("video_formats"):
                raise serializers.ValidationError(
                    {"attachments": "К загрузке доступны только изображения и видеофайлы"}
                )
            file = File.objects.create(
                name="SupportTicket",
                path=attachment,
                owner=self.context.get("request").user,
            )
            if data.get("attachments"):
                data["attachments"].append(file)
            else:
                data["attachments"] = [file]
        data["user"] = self.context.get("request").user
        return data
