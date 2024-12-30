from django.shortcuts import render
from django.views.generic import TemplateView
from dls.utils import get_menu
from support.permissions import CanSeeSystemLogsMixin


class WSGIErrorsPage(CanSeeSystemLogsMixin, TemplateView):
    template_name = "support_wsgilogs_page.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Ошибки WSGI',
                   'menu': get_menu(request.user)}
        return render(request, self.template_name, context)


class SupportTicketsPage(CanSeeSystemLogsMixin, TemplateView):
    template_name = 'support_tickets_page.html'

    def get(self, request, *args, **kwargs):
        context = {'title': 'Обращения',
                   'menu': get_menu(request.user),
                   'admin_mode': True}
        return render(request, self.get_template_names(), context)
