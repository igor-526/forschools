from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView


class TgJournalPage(LoginRequiredMixin, TemplateView):
    template_name = "tgbot_journal.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Журнал Telegram'}
        return render(request, self.template_name, context)



