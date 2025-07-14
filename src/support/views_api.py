import datetime

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q

from rest_framework import status
from rest_framework.generics import (ListAPIView,
                                     ListCreateAPIView,
                                     RetrieveAPIView)
from rest_framework.response import Response
from rest_framework.views import APIView

from support.permissions import CanChangeSystemLogsMixin, CanSeeSystemLogsMixin

from .models import SupportTicket, TelegramErrorsLog, WSGIErrorsLog
from .serializers import (SupportTicketListSerializer,
                          TelegramErrorsLogListSerializer,
                          TelegramErrorsLogSerializer,
                          WSGIErrorsLogListSerializer,
                          WSGIErrorsLogSerializer)


class WSGIErrorsListAPIView(CanSeeSystemLogsMixin, ListAPIView):
    model = WSGIErrorsLog
    serializer_class = WSGIErrorsLogListSerializer

    def filter_queryset_all(self, queryset):
        if not queryset:
            return queryset
        handling_status = self.request.query_params.get("handling_status")
        dt_start = self.request.query_params.get("dt_start")
        dt_end = self.request.query_params.get("dt_end")
        path = self.request.query_params.get("path")
        codes = self.request.query_params.getlist("code")
        users = self.request.query_params.getlist("user")
        methods = self.request.query_params.getlist("method")
        q_dict = {}
        if handling_status:
            q_dict["handling_status"] = int(handling_status)
        if dt_start:
            dt_start = datetime.datetime.strptime(dt_start, "%Y-%m-%d")
            q_dict["dt__gte"] = dt_start
        if dt_end:
            dt_end = datetime.datetime.strptime(dt_end, "%Y-%m-%d")
            q_dict["dt__lte"] = dt_end
        if path:
            q_dict["path_info__icontains"] = path
        if users:
            if 'unauth' in users:
                users.remove('unauth')
            q_dict["user__id__in"] = users
        if methods:
            q_dict["method__in"] = methods
        if codes:
            q_dict["status_code__in"] = codes
        return queryset if len(q_dict) == 0 else queryset.filter(**q_dict)

    def get_queryset(self, *args, **kwargs):
        queryset = WSGIErrorsLog.objects.order_by("-dt").all()
        queryset = self.filter_queryset_all(queryset)
        return queryset.distinct()[:50] if queryset else None


class WSGIErrorsRetrieveAPIView(CanSeeSystemLogsMixin, RetrieveAPIView):
    queryset = WSGIErrorsLog.objects.all()
    serializer_class = WSGIErrorsLogSerializer


class WSGIErrorsSetStatusAPIView(CanChangeSystemLogsMixin, APIView):
    def post(self, request, *args, **kwargs):
        queryset = WSGIErrorsLog.objects.filter(
            id__in=request.POST.getlist("log_id")
        )
        for log in queryset:
            log.handling_status = request.POST.get("handling_status")
            log.save()
        return Response(data={"status": "ok"}, status=status.HTTP_200_OK)


class TelegramErrorsListAPIView(CanSeeSystemLogsMixin, ListAPIView):
    model = TelegramErrorsLog
    serializer_class = TelegramErrorsLogListSerializer

    def filter_queryset_all(self, queryset):
        handling_status = self.request.query_params.get("handling_status")
        action_type = self.request.query_params.get("action_type")
        dt_start = self.request.query_params.get("dt_start")
        dt_end = self.request.query_params.get("dt_end")
        users = self.request.query_params.getlist("user")
        q_dict = {}
        if handling_status:
            q_dict["handling_status"] = int(handling_status)
        if action_type:
            q_dict["action_type"] = int(action_type)
        if dt_start:
            dt_start = datetime.datetime.strptime(dt_start, "%Y-%m-%d")
            q_dict["dt__date__gte"] = dt_start
        if dt_end:
            dt_end = datetime.datetime.strptime(dt_end, "%Y-%m-%d")
            q_dict["dt__date__lte"] = dt_end
        if users:
            q_dict["tg_note__user__id__in"] = users
        return queryset if len(q_dict) == 0 else queryset.filter(**q_dict)

    def get_queryset(self, *args, **kwargs):
        queryset = TelegramErrorsLog.objects.order_by("-dt").all()
        queryset = self.filter_queryset_all(queryset)
        return queryset.distinct()[:50] if queryset else None


class TelegramErrorsRetrieveAPIView(CanSeeSystemLogsMixin, RetrieveAPIView):
    queryset = TelegramErrorsLog.objects.all()
    serializer_class = TelegramErrorsLogSerializer


class TelegramErrorsSetStatusAPIView(CanChangeSystemLogsMixin, APIView):
    def post(self, request, *args, **kwargs):
        queryset = TelegramErrorsLog.objects.filter(
            id__in=request.POST.getlist("log_id")
        )
        for log in queryset:
            log.handling_status = request.POST.get("handling_status")
            log.save()
        return Response(data={"status": "ok"}, status=status.HTTP_200_OK)


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
            if "null" in q_status:
                q_status.remove("null")
                filteres_ids = list(filter(
                    lambda ticket: ticket.get_status() in q_status, queryset
                ))
                queryset = queryset.filter(Q(id__in=filteres_ids) |
                                           Q(answers__isnull=True))
            else:
                filteres_ids = list(filter(
                    lambda ticket: ticket.get_status() in q_status, queryset
                ))
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
