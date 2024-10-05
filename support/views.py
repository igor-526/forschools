from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView, ListCreateAPIView
from dls.utils import get_menu
from support.permissions import CanSeeSystemLogsMixin
from .models import WSGIErrorsLog, SupportTicket
from .serializers import WSGIErrorsLogListSerializer, WSGIErrorsLogSerializer, SupportTicketListSerializer
import datetime


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
    serializer_class = SupportTicketListSerializer

    def filter_queryset_users(self, queryset):
        q_users = self.request.query_params.getlist('user')
        if q_users:
            if "null" in q_users:
                q_users.remove("null")
                queryset = queryset.filter(Q(user__id__in=q_users) |
                                           Q(user__isnull=True))
            else:
                queryset = queryset.filter(user__id__in=q_users)
        return queryset

    def filter_queryset_date_start(self, queryset):
        q_dts = self.request.query_params.get('dt_start')
        if q_dts:
            dt = datetime.datetime.strptime(q_dts, '%Y-%m-%d')
            queryset = queryset.filter(dt__gte=dt)
        return queryset

    def filter_queryset_date_end(self, queryset):
        q_dte = self.request.query_params.get('dt_end')
        if q_dte:
            dt = datetime.datetime.strptime(q_dte, '%Y-%m-%d')
            queryset = queryset.filter(dt__lte=dt)
        return queryset

    def filter_queryset_description(self, queryset):
        q_description = self.request.query_params.get('description')
        if q_description:
            queryset = queryset.filter(description__icontains=q_description)
        return queryset

    def filter_queryset_status(self, queryset):
        q_status = self.request.query_params.getlist('status')
        if q_status:
            print(q_status)
            if "null" in q_status:
                q_status.remove("null")
                filteres_ids = list(filter(lambda ticket: ticket.get_status() in q_status, queryset))
                queryset = queryset.filter(Q(id__in=filteres_ids) |
                                           Q(answers__isnull=True))
            else:
                filteres_ids = list(filter(lambda ticket: ticket.get_status() in q_status, queryset))
                queryset = queryset.filter(id__in=filteres_ids)
        return queryset

    def get_queryset(self, *args, **kwargs):
        queryset = SupportTicket.objects.all()
        queryset = self.filter_queryset_users(queryset)
        queryset = self.filter_queryset_date_start(queryset)
        queryset = self.filter_queryset_date_end(queryset)
        queryset = self.filter_queryset_description(queryset)
        queryset = self.filter_queryset_status(queryset)
        return queryset.distinct()[:50]
