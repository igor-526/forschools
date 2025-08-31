from django.core.cache import cache
from django.db.models import Q
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from profile_management.api_v2.serializers import (NewUserNameListSerializer,
                                                   NewUserNameRolesListSerializer)
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