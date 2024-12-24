from django.contrib.auth.mixins import LoginRequiredMixin

from chat.permissions import can_see_other_users_messages
from dls.settings import MATERIAL_FORMATS
from django.shortcuts import render
from django.views.generic import TemplateView
from dls.utils import get_menu


class ChatPageTemplateView(LoginRequiredMixin, TemplateView):
    template_name = "chat_main.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Сообщения',
                   'menu': get_menu(request.user),
                   'material_formats': MATERIAL_FORMATS,
                   'can_see_other_users_messages': can_see_other_users_messages(request),
                   'can_add_group_chat': True}
        return render(request, self.template_name, context)
