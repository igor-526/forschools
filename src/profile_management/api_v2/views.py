from datetime import datetime

from django.core.cache import cache
from django.db.models import Q
from rest_framework import status
from rest_framework.generics import ListAPIView, ListCreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from profile_management.api_v2.serializers import (NewUserNameListSerializer,
                                                   NewUserNameRolesListSerializer,
                                                   NewUserSerializer)
from profile_management.models import NewUser


class UsersNameOnlyListAPIView(ListAPIView):
    model = NewUser
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.query_params.get('show_roles', None) == 'true':
            return NewUserNameRolesListSerializer
        return NewUserNameListSerializer

    def filter_queryset(self, queryset):
        query_params = self.request.query_params

        filter_roles = query_params.getlist('filter_roles[]', [])

        exclude_me = query_params.get('exclude_me', None) == 'true'

        filter_query = {}
        exclude_query = {}

        if exclude_me:
            exclude_query["id"] = self.request.user.id

        queryset = queryset.filter(**filter_query).exclude(**exclude_query)
        if query_params.get('show_roles', None) == 'true' or filter_roles:
            queryset = queryset.prefetch_related('groups')
            self.save_roles_in_cache(queryset)
        return queryset

    def get_queryset(self, *args, **kwargs):
        user_roles = self.request.user.roles
        if "Admin" in user_roles:
            return self.filter_queryset(NewUser.objects.all())

        q_objects = []

        if "Metodist" in user_roles:
            q_objects.append(Q(plan_listeners__metodist=self.request.user.id, is_active=True))
            q_objects.append(Q(plan_curator__metodist=self.request.user.id, is_active=True))
            q_objects.append(Q(plan_teacher__metodist=self.request.user.id, is_active=True))
        if "Teacher" in user_roles:
            q_objects.append(Q(plan_listeners__teacher=self.request.user.id, is_active=True))
            q_objects.append(Q(plan_curator__teacher=self.request.user.id, is_active=True))
            q_objects.append(Q(plan_metodist__teacher=self.request.user.id, is_active=True))
        if "Curator" in user_roles:
            q_objects.append(Q(plan_listeners__curators=self.request.user.id, is_active=True))
            q_objects.append(Q(plan_teacher__curators=self.request.user.id, is_active=True))
            q_objects.append(Q(plan_metodist__curators=self.request.user.id, is_active=True))
        if "Listener" in user_roles:
            q_objects.append(Q(plan_teacher__listeners=self.request.user.id, is_active=True))
            q_objects.append(Q(plan_curator__listeners=self.request.user.id, is_active=True))

        combined_q = q_objects[0]
        for q in q_objects[1:]:
            combined_q |= q
        return self.filter_queryset(NewUser.objects.filter(combined_q))

    @staticmethod
    def save_roles_in_cache(queryset):
        for user in queryset:
            cache_key = f'user_{user.id}_roles'
            if not cache.get(cache_key):
                roles = user.groups.all().only("name").values_list("name", flat=True)
                cache.set(cache_key, roles, timeout=60 * 60 * 24)


class UsersListCreateAPIView(ListCreateAPIView):
    model = NewUser
    permission_classes = [IsAuthenticated]
    serializer_class = NewUserSerializer

    def filter_fullname(self, queryset):
        q_fullname = self.request.query_params.get('full_name')
        if q_fullname:
            splitted_fullname = q_fullname.split(" ")
            q = Q()
            for query in splitted_fullname:
                q |= Q(first_name__icontains=query)
                q |= Q(last_name__icontains=query)
                q |= Q(patronymic__icontains=query)
            queryset = queryset.filter(q)
        return queryset

    @staticmethod
    def build_filter_query_dict(query_params):
        query_dict = dict()

        q_id = query_params.get('id')
        q_username = query_params.get('username')
        q_roles = query_params.getlist('role[]')
        la_date_start = query_params.get('la_date_start')
        la_date_end = query_params.get('la_date_end')
        la_type = query_params.get('la_type')
        filter_is_active = query_params.get('is_active')

        if q_id:
            query_dict['id'] = q_id
        if q_username:
            query_dict['username__icontains'] = q_username
        if q_roles:
            query_dict['groups__name__in'] = q_roles
        if la_date_start:
            date_start = datetime.strptime(la_date_start,
                                           "%Y-%m-%d")
            query_dict['last_activity__date__gte'] = date_start
        if la_date_end:
            date_end = datetime.strptime(la_date_end,
                                         "%Y-%m-%d")
            query_dict['last_activity__date__lte'] = date_end
        if la_type == 'tg':
            query_dict['last_activity_type'] = 0
        if la_type == 'web':
            query_dict['last_activity_type'] = 1
        if la_type == 'reg':
            query_dict['last_activity_type'] = 2

        if filter_is_active == "true":
            query_dict['is_active'] = True
        elif filter_is_active == "false":
            query_dict['is_active'] = False

        return query_dict

    def build_exclude_query_dict(self, query_params):
        exclude_query_dict = dict()

        exclude_me = query_params.get('exclude_me', False) == 'true'

        if exclude_me:
            exclude_query_dict['id'] = self.request.user.id

        return exclude_query_dict

    def get_queryset(self, *args, **kwargs):
        queryset = NewUser.objects.filter(**self.build_filter_query_dict(kwargs["qp"])).exclude(**self.build_exclude_query_dict(kwargs["qp"]))

        # queryset = NewUserSerializer.objects.annotate(
        #     awaiting_lessons_count=Count(
        #         'phases__lessons',
        #         distinct=True,
        #         filter=Q(phases__lessons__status=0)
        #     )
        # ).select_related(
        #     "teacher", "metodist", "default_hw_teacher"
        # ).prefetch_related("listeners", "curators").filter(**self.build_query_dict(kwargs["qp"]))
        return queryset

    def list(self, request, *args, **kwargs):
        query_params = request.query_params
        queryset = self.get_queryset(qp=query_params)
        page = query_params.get("page")
        if page:
            try:
                page = int(page)
                if page < 1:
                    page = 1
            except ValueError:
                page = 1
        else:
            page = 1

        count = queryset.count()
        queryset = queryset[(page-1) * 50:page * 50]

        return Response(data={"count": count,
                              "items": self.serializer_class(queryset, many=True, context={"request": request}).data},
                        status=status.HTTP_200_OK)