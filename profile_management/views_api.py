from datetime import datetime
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q, Count
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from chat.permissions import can_see_other_users_messages
from .permissions import (get_editable_perm,
                          get_secretinfo_perm,
                          CanSeeEventJournalMixin)
from .models import NewUser, ProfileEventsJournal
from .serializers import (NewUserDetailSerializer,
                          NewUserListSerializer,
                          NewUserNameOnlyListSerializer,
                          NewUserLastMessageDateListSerializer,
                          ProfileEventsJournalSerializer)


class DeactivateUserAPIView(LoginRequiredMixin, APIView):
    def get(self, request, *args, **kwargs):
        try:
            user = NewUser.objects.get(pk=kwargs.get('pk'))
            if get_secretinfo_perm(request.user, user):
                result = user.get_info_deactivate()
                return Response(result, status=status.HTTP_200_OK)
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)
        except Exception as ex:
            return Response(
                data={'status': 'error', 'errors': ex},
                status=status.HTTP_400_BAD_REQUEST
            )

    def patch(self, request, *args, **kwargs):
        try:
            user = NewUser.objects.get(pk=kwargs.get('pk'))
            if get_secretinfo_perm(request.user, user) and user.get_info_deactivate().get('can_deactivate') is True:
                user.is_active = False
                user.save()
                return Response(
                    data={'status': 'success'},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)
        except Exception as ex:
            return Response(
                data={'status': 'error', 'errors': ex},
                status=status.HTTP_400_BAD_REQUEST
            )


class ActivateUserAPIView(LoginRequiredMixin, APIView):
    def patch(self, request, *args, **kwargs):
        try:
            user = NewUser.objects.get(pk=kwargs.get('pk'))
            if get_editable_perm(request.user, user):
                user.is_active = True
                user.save()
                return Response(
                    data={'status': 'success'},
                    status=status.HTTP_200_OK
                )
            else:
                raise PermissionDenied()
        except Exception as ex:
            return Response(
                data={'status': 'error', 'errors': ex},
                status=status.HTTP_400_BAD_REQUEST
            )


class ChangePasswordAPIView(LoginRequiredMixin, APIView):
    def patch(self, request, *args, **kwargs):
        try:
            user = NewUser.objects.get(pk=kwargs.get('pk'))
            if get_editable_perm(request.user, user):
                new_password = request.data.get('password')
                validate_password(new_password)
                user.set_password(new_password)
                user.save()
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)
            return Response(
                data={'status': 'success'},
                status=status.HTTP_200_OK
            )
        except ValidationError as ex:
            return Response(
                data={'status': 'error', 'password': ex.messages},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserListAPIView(LoginRequiredMixin, ListAPIView):
    def get_serializer_class(self):
        setting = self.request.query_params.get("setting")
        if setting == 'messagesadmin':
            if can_see_other_users_messages(self.request):
                return NewUserLastMessageDateListSerializer
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)
        else:
            return NewUserListSerializer

    def filter_tg(self, queryset):
        q_tg = self.request.query_params.get('tg_status')
        if q_tg == "connected":
            queryset = queryset.annotate(
                tg_count=Count("telegram")
            ).filter(tg_count__gt=0)
        elif q_tg == "disconnected":
            queryset = queryset.annotate(
                tg_count=Count("telegram")
            ).filter(tg_count=0)
        return queryset

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

    def filter_queryset_fields(self, queryset):
        query = dict()

        q_id = self.request.query_params.get('id')
        q_username = self.request.query_params.get('username')
        q_roles = self.request.query_params.getlist('role')
        la_date_start = self.request.query_params.get('la_date_start')
        la_date_end = self.request.query_params.get('la_date_end')
        la_type = self.request.query_params.get('la_type')
        if q_id:
            query['id'] = q_id
        if q_username:
            query['username__icontains'] = q_username
        if q_roles:
            query['groups__name__in'] = q_roles
        if la_date_start:
            date_start = datetime.strptime(la_date_start,
                                           "%Y-%m-%d")
            query['last_activity__date__gte'] = date_start
        if la_date_end:
            date_end = datetime.strptime(la_date_end,
                                         "%Y-%m-%d")
            query['last_activity__date__lte'] = date_end
        if la_type == 'tg':
            query['last_activity_type'] = 0
        if la_type == 'web':
            query['last_activity_type'] = 1
        if la_type == 'reg':
            query['last_activity_type'] = 2

        exclude_query = dict()
        exclude_me = self.request.query_params.get('exclude_me')
        if exclude_me == "True":
            exclude_query['id'] = self.request.user.id

        order_query = ["-is_active"]
        sort_username = self.request.query_params.get('sort_username')
        sort_full_name = self.request.query_params.get('sort_full_name')
        sort_id = self.request.query_params.get('sort_id')
        sort_la_date = self.request.query_params.get('sort_la_date')
        if sort_id == "asc":
            order_query.append('id')
        elif sort_id == "desc":
            order_query.append('-id')
        if sort_username == "asc":
            order_query.append('username')
        elif sort_username == "desc":
            order_query.append('-username')
        if sort_la_date == "asc":
            order_query.append('last_activity')
        elif sort_la_date == "desc":
            order_query.append('-last_activity')
        if sort_full_name == "asc":
            order_query.append('last_name')
        elif sort_full_name == "desc":
            order_query.append('-last_name')
        else:
            order_query.append('first_name')

        return queryset.filter(**query).exclude(**exclude_query).order_by(*order_query)

    def get_queryset_read_all_messages(self):
        user_groups = [group.name for group in
                       self.request.user.groups.all()]
        if "Admin" in user_groups:
            queryset = NewUser.objects.all().exclude(
                id=self.request.user.id
            )
        elif "Metodist" in user_groups:
            queryset = NewUser.objects.filter(
                Q(plan_listeners__metodist=self.request.user,
                  is_active=True) |
                Q(plan_curator__metodist=self.request.user,
                  is_active=True) |
                Q(plan_teacher__metodist=self.request.user,
                  is_active=True)
            ).exclude(id=self.request.user.id)
        else:
            queryset = None
        return queryset.distinct() if queryset else None

    def get_queryset(self):
        setting = self.request.query_params.get("setting")
        if setting == 'messagesadmin':
            return self.get_queryset_read_all_messages()
        else:
            user_groups = [group.name for group in
                           self.request.user.groups.all()]
            if "Admin" in user_groups:
                queryset = NewUser.objects.all()
            elif "Metodist" in user_groups:
                queryset = NewUser.objects.filter(
                    Q(plan_listeners__metodist=self.request.user,
                      is_active=True) |
                    Q(plan_curator__metodist=self.request.user,
                      is_active=True) |
                    Q(plan_teacher__metodist=self.request.user,
                      is_active=True)
                )
            elif "Teacher" in user_groups:
                queryset = NewUser.objects.filter(
                    Q(plan_listeners__teacher=self.request.user,
                      is_active=True) |
                    Q(plan_curator__teacher=self.request.user,
                      is_active=True) |
                    Q(plan_metodist__teacher=self.request.user,
                      is_active=True)
                )
            elif "Curator" in user_groups:
                queryset = NewUser.objects.filter(
                    Q(plan_listeners__curators=self.request.user,
                      is_active=True) |
                    Q(plan_teacher__curators=self.request.user,
                      is_active=True) |
                    Q(plan_metodist__curators=self.request.user,
                      is_active=True)
                )
            elif "Listener" in user_groups:
                queryset = NewUser.objects.filter(
                    Q(plan_teacher__listeners=self.request.user,
                      is_active=True) |
                    Q(plan_curator__listeners=self.request.user,
                      is_active=True)
                )
            else:
                queryset = None

            if queryset:
                queryset = self.filter_queryset_fields(queryset)
                queryset = self.filter_tg(queryset)
                queryset = self.filter_fullname(queryset)
            return queryset.distinct() if queryset else None


class UsersForJournalListAPIView(LoginRequiredMixin, ListAPIView):
    serializer_class = NewUserNameOnlyListSerializer

    def get_queryset(self):
        if self.request.user.groups.filter(name='Admin').exists():
            return NewUser.objects.filter(is_active=True).distinct()
        if self.request.user.groups.filter(name="Metodist").exists():
            return NewUser.objects.filter(
                Q(is_active=True,
                  groups__name__in=['Teacher', 'Listener']) |
                Q(id=self.request.user.id)
            ).distinct()
        if self.request.user.groups.filter(name="Teacher").exists():
            return NewUser.objects.filter(
                Q(plan_listeners__teacher=self.request.user,
                  is_active=True) |
                Q(plan_listeners__phases__lessons__replace_teacher=
                  self.request.user,
                  is_active=True) |
                Q(id=self.request.user.id)
            ).distinct()
        return None


class UserDetailAPIView(LoginRequiredMixin, RetrieveUpdateAPIView):
    queryset = NewUser.objects.all()
    serializer_class = NewUserDetailSerializer


class UserPhotoAPIView(LoginRequiredMixin, APIView):
    def get(self, request, *args, **kwargs):
        user = NewUser.objects.get(pk=kwargs.get('pk'))
        return Response({'photo': user.photo.url})

    def patch(self, request, *args, **kwargs):
        data = request.data
        user = NewUser.objects.get(pk=kwargs.get('pk'))
        if get_editable_perm(request.user, user):
            try:
                user.photo = data.get('photo')
                user.save()
                return Response(
                    data={"status": "success"},
                    status=200
                )
            except Exception as ex:
                return Response(
                    data={"status": "error", "errors": str(ex)},
                    status=400
                )
        else:
            raise PermissionDenied()

    def delete(self, request, *args, **kwargs):
        user = NewUser.objects.get(pk=kwargs.get('pk'))
        if get_editable_perm(request.user, user):
            try:
                user.delete_photo()
                return Response(
                    data={"status": "success"},
                    status=204
                )
            except Exception as ex:
                return Response(
                    data={"status": "error", "errors": str(ex)},
                    status=400
                )


class UsersForScheduleListAPIView(LoginRequiredMixin, ListAPIView):
    serializer_class = NewUserNameOnlyListSerializer

    def filter_queryset_name(self, queryset):
        if queryset is None:
            return None
        name = self.request.query_params.get('name')
        if name is None:
            return queryset
        splitted_fullname = name.split(" ")
        q = Q()
        for query in splitted_fullname:
            q |= Q(first_name__icontains=query)
            q |= Q(last_name__icontains=query)
            q |= Q(patronymic__icontains=query)
        return queryset.filter(q)

    def filter_queryset_role(self, queryset):
        if queryset is None:
            return None
        role = self.request.query_params.get('role')
        if role == "listeners":
            return queryset.filter(groups__name="Listener")
        elif role == "teachers":
            return queryset.filter(groups__name="Teacher")
        else:
            return queryset

    def get_queryset(self):
        usergroups = [g.name for g in self.request.user.groups.all()]
        queryset = None
        if "Admin" in usergroups:
            queryset = NewUser.objects.filter(
                groups__name__in=["Teacher", "Listener"],
                is_active=True
            ).exclude(pk=self.request.user.id)
        elif "Metodist" in usergroups:
            queryset = NewUser.objects.filter(
                Q(groups__name__in=["Teacher", "Listener"],
                  is_active=True,
                  plan_listeners__metodist=self.request.user.id) |
                Q(groups__name__in=["Teacher", "Listener"],
                  is_active=True,
                  plan_teacher__metodist=self.request.user.id
                  )
            ).exclude(pk=self.request.user.id)
        elif "Teacher" in usergroups:
            queryset = NewUser.objects.filter(
                groups__name="Listener",
                is_active=True,
                plan_listeners__metodist=self.request.user.id
            ).exclude(pk=self.request.user.id)
        elif "Listener" in usergroups:
            queryset = None
        if queryset:
            queryset = self.filter_queryset_name(queryset)
            queryset = self.filter_queryset_role(queryset)
        return queryset.distinct() if queryset else None


class ProfileEventsJournalListAPIView(CanSeeEventJournalMixin,
                                      ListAPIView):
    serializer_class = ProfileEventsJournalSerializer

    def filter_queryset_all(self, queryset):
        event = self.request.query_params.getlist('event')
        user = self.request.query_params.getlist('user')
        initiator = self.request.query_params.getlist('initiator')
        date_start = self.request.query_params.get('date_start')
        date_end = self.request.query_params.get('date_end')
        query_params = {}
        if event:
            query_params['event__in'] = event
        if user:
            query_params['user__in'] = user
        if initiator:
            query_params['initiator__in'] = initiator
        if date_start:
            date_start = datetime.strptime(date_start,
                                           "%Y-%m-%d")
            query_params['dt__date__gte'] = date_start
        if date_end:
            date_end = datetime.strptime(date_end,
                                         "%Y-%m-%d")
            query_params['dt__date__lte'] = date_end
        return (queryset.filter(**query_params).distinct() if
                queryset else None)

    def get_queryset(self):
        queryset = ProfileEventsJournal.objects.all()
        queryset = self.filter_queryset_all(queryset)
        return queryset
