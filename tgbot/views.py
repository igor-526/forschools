from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView
from dls.utils import get_menu


class TgJournalPage(LoginRequiredMixin, TemplateView):
    template_name = "tgbot_journal.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Журнал Telegram',
                   'menu': get_menu(request.user)}
        return render(request, self.template_name, context)



