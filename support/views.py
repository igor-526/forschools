from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView, ListCreateAPIView
from dls.utils import get_menu
from support.permissions import CanSeeSystemLogsMixin
from .models import WSGIErrorsLog, SupportTicket
from .serializers import WSGIErrorsLogListSerializer, WSGIErrorsLogSerializer, SupportTicketSerializer


class WSGIErrorsPage(CanSeeSystemLogsMixin, TemplateView):
    template_name = "support_wsgilogs_page.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Ошибки WSGI',
                   'menu': get_menu(request.user)}
        return render(request, self.template_name, context)


class WSGIErrorsListAPIView(CanSeeSystemLogsMixin, ListAPIView):
    model = WSGIErrorsLog
    serializer_class = WSGIErrorsLogListSerializer

    def get_queryset(self, *args, **kwargs):
        queryset = WSGIErrorsLog.objects.all()
        return queryset.distinct()[:50]


class WSGIErrorsRetrieveUpdateAPIView(CanSeeSystemLogsMixin, RetrieveUpdateAPIView):
    queryset = WSGIErrorsLog.objects.all()
    serializer_class = WSGIErrorsLogSerializer


class SupportTicketsListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
    model = SupportTicket
    serializer_class = SupportTicketSerializer

    def get_queryset(self, *args, **kwargs):
        queryset = SupportTicket.objects.all()
        return queryset.distinct()[:50]
