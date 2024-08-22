from rest_framework import serializers
from material.serializers import FileSerializer
from profile_management.serializers import NewUserNameOnlyListSerializer
from tgbot.utils import send_chat_message
from .models import Message
from material.models import File


class ChatMessageSerializer(serializers.ModelSerializer):
    sender = NewUserNameOnlyListSerializer(many=False, read_only=True)
    receiver = NewUserNameOnlyListSerializer(many=False, read_only=True)
    files = FileSerializer(many=True, read_only=True)

    class Meta:
        model = Message
        fields = "__all__"

    def create(self, validated_data):
        request = self.context.get("request")
        message = Message.objects.create(**validated_data,
                                         receiver_id=self.context.get("receiver"),
                                         sender=request.user)
        attachments = request.FILES.getlist("attachments")
        if attachments:
            att_list = []
            for attachment in attachments:
                file = File.objects.create(name="Сообщение",
                                           owner=request.user,
                                           path=attachment)
                att_list.append(file)
            message.files.set(att_list)
            message.save()
        send_chat_message(message)
        return message
