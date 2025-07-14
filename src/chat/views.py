from chat.permissions import CanSeeAdminChats, can_see_other_users_messages

from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView

from dls.settings import MATERIAL_FORMATS


class ChatPageTemplateView(LoginRequiredMixin, TemplateView):
    template_name = "chat_main.html"

    def get_template_names(self):
        if self.request.user_agent.is_mobile:
            return 'mobile/chats_mobile.html'
        return 'chat_main.html'

    def get(self, request, *args, **kwargs):
        context = {
            'title': 'Сообщения',
            'can_see_other_users_messages':
                can_see_other_users_messages(request),
            'can_add_group_chat': True
        }
        if self.request.user_agent.is_mobile:
            context['menu_m'] = "msg"
        return render(request, self.get_template_names(), context)


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
