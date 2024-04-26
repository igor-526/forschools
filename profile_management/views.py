from django.contrib.auth.decorators import permission_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.password_validation import validate_password
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
from .permissions import CanSeeUserPageMixin, get_editable_perm, get_deactivate_perm
from .forms import SignUpForm
from .models import NewUser
from .serializers import (NewUserDetailSerializer,
                          NewUserListSerializer)


def user_login(request):    # страница авторизации и логин
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
                user = form.save()
                user.update_tg_code()
                status = user.set_groups(groups)
                if status != "success":
                    raise ValidationError({'role': status})
            except ValidationError as err:
                js = []
                for message in err.messages:
                    js.append({'role': message})

                return JsonResponse(js, status=400, safe=False)
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse(form.errors, status=400)


class DeactivateUserView(LoginRequiredMixin, APIView):
    def patch(self, request, *args, **kwargs):
        try:
            user = NewUser.objects.get(pk=kwargs.get('pk'))
            if get_deactivate_perm(request.user, user):
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
                   'self': puser == request.user}
        return render(request, self.template_name, context)


class UsersPage(CanSeeUserPageMixin, TemplateView):  # страница пользователей (администрирование)
    template_name = "users/users.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Пользователи',
                   'menu': get_menu(request.user),
                   'perms': dumps({'permissions': list(request.user.get_all_permissions())})}
        return render(request, self.template_name, context)


class UserListAPIView(LoginRequiredMixin, ListAPIView):     # API для вывода списка пользователей
    serializer_class = NewUserListSerializer

    def get_queryset(self):
        group = self.request.query_params.get('group')
        if not group:
            usergroups = [group.name for group in self.request.user.groups.all()]
            if "Admin" in usergroups:
                return NewUser.objects.exclude(id=self.request.user.pk)
            return NewUser.objects.exclude(id=self.request.user.pk).filter(is_active=True)
        elif group == 'listeners':
            return NewUser.objects.filter(groups__name='Listener').filter(is_active=True)
        elif group == 'teachers':
            return NewUser.objects.filter(groups__name='Teacher').filter(is_active=True)


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

