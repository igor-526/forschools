from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView
from chat.permissions import can_see_other_users_messages, CanSeeAdminChats
from dls.settings import MATERIAL_FORMATS


class ChatPageSelectUserMATemplateView(LoginRequiredMixin, TemplateView):
    template_name = "ma/chats_users.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Сообщения',
                   'can_see_other_users_messages':
                       can_see_other_users_messages(request),
                   "is_authenticated": request.user.is_authenticated}
        return render(request, self.template_name, context)


class ChatPageChatMATemplateView(LoginRequiredMixin, TemplateView):
    template_name = "ma/chats_chat.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Сообщения',
                   'can_see_other_users_messages':
                       can_see_other_users_messages(request),
                   "is_authenticated": request.user.is_authenticated,
                   "chat_id": kwargs.get('chat_id'),
                   'material_formats': MATERIAL_FORMATS}
        return render(request, self.template_name, context)


class ChatAdminPageSelectUserMATemplateView(CanSeeAdminChats, TemplateView):
    template_name = "ma/chats_admin_users.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Сообщения',
                   "is_authenticated": request.user.is_authenticated}
        return render(request, self.template_name, context)


class ChatAdminPageChatMATemplateView(CanSeeAdminChats, TemplateView):
    template_name = "ma/chats_admin_chat.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Сообщения',
                   "is_authenticated": request.user.is_authenticated,
                   "chat_id": kwargs.get('chat_id'),
                   'material_formats': MATERIAL_FORMATS}
        return render(request, self.template_name, context)
