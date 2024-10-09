from django.contrib.auth.decorators import permission_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q, Count
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic import TemplateView
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.views import APIView
from dls.utils import get_menu
from json import dumps
from django.http import Http404
from .permissions import CanSeeUserPageMixin, get_editable_perm, get_secretinfo_perm
from .forms import SignUpForm
from .models import NewUser
from .serializers import (NewUserDetailSerializer, NewUserListSerializer,
                          NewUserNameOnlyListSerializer, NewUserLastMessageDateListSerializer)


def user_login(request):    # страница авторизации и логин
    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse_lazy('dashboard'))
    if request.POST:
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse_lazy('dashboard'))
    return render(request, 'login.html')


def user_logout(request):    # логаут
    logout(request)
    return HttpResponseRedirect(reverse_lazy('login'))


@permission_required(perm='auth.register_users', raise_exception=True)
def register_view(request):     # API для регистрации пользователей
    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            groups = request.POST.getlist('role')
            try:
                if len(groups) == 0:
                    raise ValidationError({'role': 'Необходимо выбрать хотя бы одну роль'})
                if ("Admin" in groups) and (not request.user.has_perm('auth.register_admin')):
                    raise ValidationError({'role': 'Вы не можете дать роль администратора'})
                if ("Metodist" in groups) and (not request.user.has_perm('auth.register_metodist')):
                    raise ValidationError({'role': 'Вы не можете дать роль методиста'})
                if "Curator" in groups:
                    raise ValidationError({'role': 'Данная роль пока не поддерживается'})
                if ("Teacher" in groups) and (not request.user.has_perm('auth.register_teacher')):
                    raise ValidationError({'role': 'Вы не можете дать роль преподавателя'})
                if ("Listener" in groups) and (not request.user.has_perm('auth.edit_listener')):
                    raise ValidationError({'role': 'Вы не можете редактировать учеников'})
                email = request.POST.get('email')
                username = request.POST.get('username')
                if email and username and NewUser.objects.filter(email=email).exclude(username=username).exists():
                    raise ValidationError({"email": "Пользователь с таким email уже существует"})
                user = form.save()
                user.update_tg_code()
                status = user.set_groups(groups)
                if status != "success":
                    raise ValidationError({'role': status})
            except ValidationError as err:
                return JsonResponse(dict(err), status=400, safe=False)
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse(form.errors, status=400)


class DeactivateUserView(LoginRequiredMixin, APIView):
    def patch(self, request, *args, **kwargs):
        try:
            user = NewUser.objects.get(pk=kwargs.get('pk'))
            if get_secretinfo_perm(request.user, user):
                user.is_active = False
                user.save()
                return JsonResponse({'status': 'success'}, status=status.HTTP_200_OK)
            else:
                raise PermissionDenied
        except Exception as ex:
            return JsonResponse({'status': 'error', 'errors': ex}, status=status.HTTP_400_BAD_REQUEST)


class ActivateUserView(LoginRequiredMixin, APIView):
    def patch(self, request, *args, **kwargs):
        try:
            user = NewUser.objects.get(pk=kwargs.get('pk'))
            if get_editable_perm(request.user, user):
                user.is_active = True
                user.save()
                return JsonResponse({'status': 'success'}, status=status.HTTP_200_OK)
            else:
                raise PermissionDenied
        except Exception as ex:
            return JsonResponse({'status': 'error', 'errors': ex}, status=status.HTTP_400_BAD_REQUEST)


class AdminLoginAPIView(LoginRequiredMixin, APIView):
    def get(self, request, *args, **kwargs):
        if request.user.is_superuser:
            user = NewUser.objects.get(pk=kwargs.get('pk'))
            logout(request)
            login(request, user)
            return JsonResponse({"status": "OK"},
                                status=status.HTTP_200_OK)
        else:
            return JsonResponse({"error": "У вас нет прав для авторизации под этим пользователем"},
                                status=status.HTTP_403_FORBIDDEN)


class ChangePasswordView(LoginRequiredMixin, APIView):
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
            return JsonResponse({'status': 'success'}, status=status.HTTP_200_OK)
        except ValidationError as ex:
            return JsonResponse({'status': 'error', 'password': ex.messages}, status=status.HTTP_400_BAD_REQUEST)


class DashboardPage(LoginRequiredMixin, TemplateView):    # главная страница Dashboard
    template_name = "dashboard.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Дэшборд', 'menu': get_menu(request.user)}
        return render(request, self.template_name, context)


class ProfilePage(LoginRequiredMixin, TemplateView):
    template_name = "profile/profile.html"

    def get(self, request, *args, **kwargs):
        user_object = {
            'first_name': None,
            'last_name': None,
            'photo': None,
            'role': None,
            'last_activity': None,
            'date_joined': None,
            'bdate': None,
            'private_lessons': None,
            'group_lessons': None,
            'note': None,
            'progress': None,
            'level': None,
            'age': None,
            'id': None,
            'email': None,
            'tg': False
        }
        if self.kwargs.get('pk'):
            puser = NewUser.objects.filter(id=self.kwargs.get('pk')).first()
        else:
            puser = request.user
        if puser:
            user_object['first_name'] = puser.first_name
            user_object['last_name'] = puser.last_name
            user_object['photo'] = puser.photo.url
            user_object['last_activity'] = puser.last_activity
            user_object['date_joined'] = puser.date_joined
            user_object['id'] = puser.id
            user_object['bdate'] = puser.bdate
            user_object['email'] = puser.email
            role = puser.groups.first().name
            perms = request.user.get_all_permissions()
            if role == 'Admin':
                user_object['role'] = 'Администратор'
                if 'auth.see_moreinfo_admin' in perms:
                    user_object['note'] = puser.note
            if role == 'Metodist':
                user_object['role'] = 'Методист'
                if 'auth.see_moreinfo_metodist' in perms:
                    user_object['note'] = puser.note
            if role == 'Teacher':
                user_object['role'] = 'Преподаватель'
                user_object['private_lessons'] = True if puser.private_lessons else False
                user_object['group_lessons'] = True if puser.group_lessons else False
                user_object['level'] = puser.level
                if 'auth.see_moreinfo_teacher' in perms:
                    user_object['note'] = puser.note
            if role == 'Listener':
                user_object['role'] = 'Ученик'
                user_object['private_lessons'] = True if puser.private_lessons else False
                user_object['group_lessons'] = True if puser.group_lessons else False
                user_object['level'] = puser.level
                if 'auth.see_moreinfo_listener' in perms:
                    user_object['note'] = puser.note
                    user_object['progress'] = puser.progress
        else:
            raise Http404

        context = {'title': f"Профиль: {puser}",
                   'menu': get_menu(request.user),
                   'puser': user_object,
                   'can_see_data': True,
                   'self': puser == request.user}
        return render(request, self.template_name, context)


class UsersPage(CanSeeUserPageMixin, TemplateView):  # страница пользователей (администрирование)
    template_name = "users/admin_users.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Пользователи',
                   'menu': get_menu(request.user),
                   'perms': dumps({'permissions': list(request.user.get_all_permissions())})}
        return render(request, self.template_name, context)


class UserListAPIView(LoginRequiredMixin, ListAPIView):     # API для вывода списка пользователей
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
                Q(plan_listeners__teacher=self,
                  is_active=True) |
                Q(plan_listeners__phases__lessons__replace_teacher=self,
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


class UserDetailAPIView(LoginRequiredMixin, RetrieveUpdateAPIView):    # API для вывода/изменения/удаления пользователя
    queryset = NewUser.objects.all()
    serializer_class = NewUserDetailSerializer


class UserPhotoApiView(LoginRequiredMixin, APIView):    # API для получения, изменения и обновления фото
    def get(self, request, *args, **kwargs):
        user = NewUser.objects.get(pk=kwargs.get('pk'))
        return JsonResponse({'photo': user.photo.url})

    def patch(self, request, *args, **kwargs):
        data = request.data
        user = NewUser.objects.get(pk=kwargs.get('pk'))
        if get_editable_perm(request.user, user):
            try:
                user.photo = data.get('photo')
                user.save()
                return JsonResponse({"status": "success"}, status=200)
            except Exception as ex:
                return JsonResponse({"status": "error", "errors": str(ex)}, status=400)
        else:
            raise PermissionDenied

    def delete(self, request, *args, **kwargs):
        user = NewUser.objects.get(pk=kwargs.get('pk'))
        if get_editable_perm(request.user, user):
            try:
                user.delete_photo()
                return JsonResponse({"status": "success"}, status=204)
            except Exception as ex:
                return JsonResponse({"status": "error", "errors": str(ex)}, status=400)


class TelegramAPIView(LoginRequiredMixin, APIView):  # API для управления привязкой Telegram
    def delete(self, request, *args, **kwargs):
        try:
            user = NewUser.objects.get(id=kwargs.get('pk'))
            if get_editable_perm(request.user, user):
                user.telegram.first().delete()
                return JsonResponse({'status': 'disconnected'}, status=status.HTTP_204_NO_CONTENT)
            else:
                raise PermissionDenied
        except Exception as ex:
            return JsonResponse({"status": "error", "errors": ex}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        user = NewUser.objects.get(id=kwargs.get('pk'))
        if user.telegram.exists():
            return JsonResponse({"status": "connected"}, status=status.HTTP_200_OK)
        else:
            return JsonResponse({"status": "disconnected",
                                 "code": user.tg_code},
                                status=status.HTTP_200_OK)
