from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView
from chat.permissions import can_see_other_users_messages, CanSeeAdminChats
from dls.settings import MATERIAL_FORMATS


class ChatPageTemplateView(LoginRequiredMixin, TemplateView):
    template_name = "chat_main.html"

    def get(self, request, *args, **kwargs):
        context = {
            'title': 'Сообщения',
            'material_formats': MATERIAL_FORMATS,
            'can_see_other_users_messages':
                can_see_other_users_messages(request),
            'can_add_group_chat': True
        }
        return render(request, self.template_name, context)


class ChatAdminPageTemplateView(CanSeeAdminChats, TemplateView):
    template_name = "admin_chats_main.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Сообщения администратору',
                   'material_formats': MATERIAL_FORMATS}
        return render(request, self.template_name, context)


class ChatUnsentPageTemplateView(CanSeeAdminChats, TemplateView):
    template_name = "chats_unsent.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Неотправленные сообщения'}
        return render(request, self.template_name, context)
