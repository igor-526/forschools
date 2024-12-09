from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q, Count
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from .permissions import get_editable_perm, get_secretinfo_perm
from .models import NewUser
from .serializers import (NewUserDetailSerializer, NewUserListSerializer,
                          NewUserNameOnlyListSerializer, NewUserLastMessageDateListSerializer)


class DeactivateUserAPIView(LoginRequiredMixin, APIView):
    def patch(self, request, *args, **kwargs):
        try:
            user = NewUser.objects.get(pk=kwargs.get('pk'))
            if get_secretinfo_perm(request.user, user):
                user.is_active = False
                user.save()
                return Response({'status': 'success'}, status=status.HTTP_200_OK)
            else:
                raise PermissionDenied
        except Exception as ex:
            return Response({'status': 'error', 'errors': ex}, status=status.HTTP_400_BAD_REQUEST)


class ActivateUserAPIView(LoginRequiredMixin, APIView):
    def patch(self, request, *args, **kwargs):
        try:
            user = NewUser.objects.get(pk=kwargs.get('pk'))
            if get_editable_perm(request.user, user):
                user.is_active = True
                user.save()
                return Response({'status': 'success'}, status=status.HTTP_200_OK)
            else:
                raise PermissionDenied
        except Exception as ex:
            return Response({'status': 'error', 'errors': ex}, status=status.HTTP_400_BAD_REQUEST)


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
                raise PermissionDenied
            return Response({'status': 'success'}, status=status.HTTP_200_OK)
        except ValidationError as ex:
            return Response({'status': 'error', 'password': ex.messages}, status=status.HTTP_400_BAD_REQUEST)


class UserListAPIView(LoginRequiredMixin, ListAPIView):
    def get_serializer_class(self):
        setting = self.request.query_params.get("setting")
        if setting == 'messagesadmin':
            if self.request.user.user_permissions.filter(codename="can_read_all_messages").exists():
                return NewUserLastMessageDateListSerializer
            else:
                raise PermissionDenied
        else:
            return NewUserListSerializer

    def filter_id(self, queryset):
        q_id = self.request.query_params.get('id')
        if q_id:
            queryset = queryset.filter(id=q_id)
        return queryset

    def filter_tg(self, queryset):
        q_tg = self.request.query_params.get('tg_status')
        if q_tg == "connected":
            queryset = queryset.annotate(tg_count=Count("telegram")).filter(tg_count__gt=0)
        elif q_tg == "disconnected":
            queryset = queryset.annotate(tg_count=Count("telegram")).filter(tg_count=0)
        return queryset

    def filter_username(self, queryset):
        q_username = self.request.query_params.get('username')
        if q_username:
            queryset = queryset.filter(username__icontains=q_username)
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

    def filter_roles(self, queryset):
        q_roles = self.request.query_params.getlist('role')
        if q_roles:
            queryset = queryset.filter(groups__name__in=q_roles)
        return queryset

    def sort_username(self, queryset):
        sort_username = self.request.query_params.get('sort_username')
        if sort_username == "asc":
            queryset = queryset.order_by('username')
        elif sort_username == "desc":
            queryset = queryset.order_by('-username')
        return queryset

    def sort_fullname(self, queryset):
        sort_full_name = self.request.query_params.get('sort_full_name')
        if sort_full_name == "asc":
            queryset = queryset.order_by('last_name')
        elif sort_full_name == "desc":
            queryset = queryset.order_by('-last_name')
        return queryset

    def exclude_me(self, queryset):
        exclude_me = self.request.query_params.get('exclude_me')
        if exclude_me == "True":
            queryset = queryset.exclude(id=self.request.user.id)
        return queryset

    def get_queryset(self):
        if self.request.user.groups.filter(name="Admin"):
            queryset = NewUser.objects.all()
        elif self.request.user.groups.filter(name="Metodist"):
            queryset = NewUser.objects.filter(is_active=True)
        elif self.request.user.groups.filter(name="Teacher"):
            queryset = NewUser.objects.filter(
                Q(plan_listeners__teacher=self.request.user,
                  is_active=True) |
                Q(plan_listeners__phases__lessons__replace_teacher=self.request.user,
                  is_active=True) |
                Q(groups__name__in=['Admin', 'Metodist'],
                  is_active=True))
        else:
            queryset = None

        if queryset:
            queryset = self.exclude_me(queryset)
            queryset = self.filter_id(queryset)
            queryset = self.filter_tg(queryset)
            queryset = self.filter_username(queryset)
            queryset = self.filter_fullname(queryset)
            queryset = self.filter_roles(queryset)
            queryset = self.sort_username(queryset)
            queryset = self.sort_fullname(queryset)
            queryset = queryset.order_by("-is_active")
        if queryset:
            return queryset.distinct()
        else:
            return None


class TeacherListenersListAPIView(LoginRequiredMixin, ListAPIView):
    serializer_class = NewUserNameOnlyListSerializer

    def get_queryset(self):
        if self.request.user.groups.filter(name__in=['Admin', 'Metodist']).exists():
            if self.request.query_params.get('group') == 'teacher':
                return NewUser.objects.filter(groups__name='Teacher',
                                              is_active=True).distinct()
            elif self.request.query_params.get('group') == 'listener':
                return NewUser.objects.filter(groups__name='Listener',
                                              is_active=True).distinct()
        if self.request.user.groups.filter(name="Teacher").exists():
            if self.request.query_params.get('group') == 'teacher':
                return NewUser.objects.filter(pk=self.request.user.id).distinct()
            elif self.request.query_params.get('group') == 'listener':
                return NewUser.objects.filter(
                    Q(plan_listeners__teacher=self.request.user,
                      is_active=True) |
                    Q(plan_listeners__phases__lessons__replace_teacher=self.request.user,
                      is_active=True)
                ).distinct()
        if self.request.user.groups.filter(name='Listener').exists():
            if self.request.query_params.get('group') == 'teacher':
                return NewUser.objects.filter(
                    Q(plan_teacher__listeners=self.request.user,
                      is_active=True) |
                    Q(replace_teacher__learningphases__learningplan__listeners=self.request.user,
                      is_active=True)).distinct()
            elif self.request.query_params.get('group') == 'listener':
                return NewUser.objects.filter(pk=self.request.user.id).distinct()
        return None


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
                Q(plan_listeners__phases__lessons__replace_teacher=self.request.user,
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
                return Response({"status": "success"}, status=200)
            except Exception as ex:
                return Response({"status": "error", "errors": str(ex)}, status=400)
        else:
            raise PermissionDenied

    def delete(self, request, *args, **kwargs):
        user = NewUser.objects.get(pk=kwargs.get('pk'))
        if get_editable_perm(request.user, user):
            try:
                user.delete_photo()
                return Response({"status": "success"}, status=204)
            except Exception as ex:
                return Response({"status": "error", "errors": str(ex)}, status=400)


class TelegramAPIView(LoginRequiredMixin, APIView):
    def delete(self, request, *args, **kwargs):
        try:
            user = NewUser.objects.get(id=kwargs.get('pk'))
            if get_editable_perm(request.user, user):
                user.telegram.first().delete()
                return Response({'status': 'disconnected'}, status=status.HTTP_204_NO_CONTENT)
            else:
                raise PermissionDenied
        except Exception as ex:
            return Response({"status": "error", "errors": ex}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        user = NewUser.objects.get(id=kwargs.get('pk'))
        if user.telegram.exists():
            return Response({"status": "connected"}, status=status.HTTP_200_OK)
        else:
            return Response({"status": "disconnected",
                             "code": user.tg_code},
                            status=status.HTTP_200_OK)
