from datetime import datetime
from django.db.models import Q, Count
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from mailing.models import GroupMailingTasks
from mailing.permissions import MailingAccessMixin
from mailing.serializers import (MailingUsersListSerializer, GroupMailingTasksListSerializer,
                                 GroupMailingTasksItemSerializer)
from mailing.tasks import MailingGroupTask
from profile_management.models import NewUser, Telegram
from profile_management.serializers import NewUserNameOnlyListSerializer


class MailingUserListAPIView(MailingAccessMixin, APIView):
    def filter_queryset_all(self, queryset):
        if not queryset:
            return None
        role = self.request.query_params.getlist("role")
        name = self.request.query_params.get("name")
        active = self.request.query_params.get("active")
        email = self.request.query_params.get("email")
        tg = self.request.query_params.get("tg")
        query = {}
        exclude = {}
        if role:
            query["groups__name__in"] = role
        if email == "true":
            query["email__gte"] = 1
        elif email == "false":
            exclude["email__gte"] = 1
        if active == "true":
            query["is_active"] = True
        elif active == "false":
            query["is_active"] = False
        if tg == "main":
            query["id__in"] = [tgnote.user.id for tgnote in Telegram.objects.filter(usertype="main")]
        elif tg == "parents":
            query["id__in"] = [tgnote.user.id for tgnote in Telegram.objects.exclude(usertype="main")]
        elif tg == "false":
            query["tg_count"] = 0
        queryset = queryset.filter(**query).exclude(**exclude)
        if name:
            splitted_name = name.split(" ")
            q = Q()
            for query in splitted_name:
                q |= Q(first_name__icontains=query)
                q |= Q(last_name__icontains=query)
                q |= Q(patronymic__icontains=query)
            queryset = queryset.filter(q)
        return queryset.order_by("-is_active", "first_name").distinct() if queryset else None

    def get_queryset(self):
        queryset = NewUser.objects.annotate(tg_count=Count("telegram")).filter(Q(email__gte=1) |
                                                                                Q(tg_count__gt=0))
        queryset = self.filter_queryset_all(queryset)
        return queryset

    def get(self, request, *args, **kwargs):
        serializer = MailingUsersListSerializer(many=True, instance=self.get_queryset())
        return Response(serializer.data, status=status.HTTP_200_OK)


class MailingInitiatorsListAPIView(MailingAccessMixin, ListAPIView):
    serializer_class = NewUserNameOnlyListSerializer

    def get_queryset(self):
        return (NewUser.objects.annotate(mailing_count=Count("groupmailingtasks__initiator"))
                .order_by("first_name").filter(mailing_count__gt=0)).distinct()


class GroupMailingTasksListAPIView(MailingAccessMixin, ListAPIView):
    serializer_class = GroupMailingTasksListSerializer

    def get_mailing_status(self, mailing: GroupMailingTasks):
        if mailing.result_info.get('info') is None:
            return "processing"
        return "success" if mailing.result_info['info']['errors'] == 0 else "part"

    def get_queryset(self):
        initiator = self.request.query_params.getlist("initiator")
        name = self.request.query_params.get("name")
        date_start = self.request.query_params.get("date_start")
        date_end = self.request.query_params.get("date_end")
        result = self.request.query_params.get("result")
        offset = self.request.query_params.get("offset")
        query_params = {}
        if initiator:
            query_params['initiator__id__in'] = initiator
        if name:
            query_params['name__icontains'] = name
        if date_start:
            date_start = datetime.strptime(date_start, "%Y-%m-%d")
            query_params['dt__date__gte'] = date_start
        if date_end:
            date_end = datetime.strptime(date_end, "%Y-%m-%d")
            query_params['dt__date__lte'] = date_end
        queryset = GroupMailingTasks.objects.filter(**query_params)
        if result:
            res_ids = [mailing.id for mailing in list(filter(
                lambda mailing: self.get_mailing_status(mailing) == result, queryset))]
            queryset = queryset.filter(id__in=res_ids)
        offset = int(offset) if offset else 0
        return queryset.order_by("-dt").distinct()[offset:offset + 50] if queryset else None


class GroupMailingTasksRetrieveAPIView(MailingAccessMixin, RetrieveAPIView):
    serializer_class = GroupMailingTasksItemSerializer
    queryset = GroupMailingTasks.objects.all()


class MailingStartAPIView(MailingAccessMixin, APIView):
    def post(self, request, *args, **kwargs):
        users = request.data.get("users")
        name = request.data.get("name")
        if not name:
            name = f"Рассылка {GroupMailingTasks.objects.count() + 1}"
        if "self" in users:
            users[request.user.id] = users['self']
            users.pop("self")
        task = GroupMailingTasks.objects.create(
            name=name,
            users=users,
            messages=request.data.get("messages"),
            initiator=request.user
        )
        t = MailingGroupTask(task.id)
        t.execute()
        return Response({"status": "success"}, status=status.HTTP_200_OK)
