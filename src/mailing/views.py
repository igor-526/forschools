from django.shortcuts import render
from django.views.generic import TemplateView

from mailing.permissions import MailingAccessMixin


class MailingPage(MailingAccessMixin, TemplateView):
    template_name = "mailing.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Рассылки'}
        return render(request, self.template_name, context)


class MailingNewPage(MailingAccessMixin, TemplateView):
    template_name = "mailing_new.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Новая рассылка'}
        return render(request, self.template_name, context)
