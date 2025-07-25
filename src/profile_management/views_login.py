from cv2 import data
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import permission_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse_lazy
from django.utils import timezone
from django.views.generic import TemplateView

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .forms import SignUpForm
from .models import NewUser, Telegram
from .permissions import CanGetWelcomeURLMixin


class LoginPageTemplateView(TemplateView):
    template_name = "login.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Авторизация'}
        return render(request, self.template_name, context)


class UserLoginAPIView(APIView):
    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return Response(status=status.HTTP_200_OK)
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)


class UserTelegramLoginAPIView(APIView):
    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            logout(request)
        token = request.POST.get("token")
        if not token:
            return Response(data={"error": "Отсутствует токен"},
                            status=status.HTTP_400_BAD_REQUEST)
        tg_note = Telegram.objects.filter(access_token=token).first()
        if not tg_note:
            return Response(status=status.HTTP_403_FORBIDDEN)
        else:
            tg_note.update_access_token(expires_only=True)
            login(request, tg_note.user)
            return Response(status=status.HTTP_200_OK)


def user_logout(request):
    logout(request)
    return HttpResponseRedirect(reverse_lazy('login'))


@permission_required(perm='auth.register_users', raise_exception=True)
@api_view(('POST',))
def register_view(request):
    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            groups = request.POST.getlist('role')
            try:
                if len(groups) == 0:
                    raise ValidationError(
                        {'role': 'Необходимо выбрать хотя бы одну роль'}
                    )
                if (("Admin" in groups) and
                        (not request.user.has_perm('auth.register_admin'))):
                    raise ValidationError(
                        {'role': 'Вы не можете дать роль администратора'}
                    )
                if (("Metodist" in groups) and
                        (not request.user.has_perm('auth.register_metodist'))):
                    raise ValidationError(
                        {'role': 'Вы не можете дать роль методиста'}
                    )
                if (("Curator" in groups) and
                        (not request.user.has_perm('auth.register_curator'))):
                    raise ValidationError(
                        {'role': 'Вы не можете дать роль куратора'}
                    )
                if (("Teacher" in groups) and
                        (not request.user.has_perm('auth.register_teacher'))):
                    raise ValidationError(
                        {'role': 'Вы не можете дать роль преподавателя'}
                    )
                if (("Listener" in groups) and
                        (not request.user.has_perm('auth.edit_listener'))):
                    raise ValidationError(
                        {'role': 'Вы не можете редактировать учеников'}
                    )
                email = request.POST.get('email')
                username = request.POST.get('username')
                if email and username and NewUser.objects.filter(
                        email=email
                ).exclude(username=username).exists():
                    raise ValidationError(
                        {"email": "Пользователь с таким email "
                                  "уже существует"}
                    )
                user = form.save()
                user.update_tg_code()
                status_groups = user.set_groups(groups)
                if status_groups != "success":
                    raise ValidationError({'role': status_groups})
            except ValidationError as err:
                return Response(dict(err), status=400)
            return Response(data={'status': 'success'})
        else:
            return Response(data=form.errors, status=400)


class AdminLoginAPIView(LoginRequiredMixin, APIView):
    def get(self, request, *args, **kwargs):
        if request.user.user_permissions.filter(
                codename="can_login"
        ).exists():
            user = NewUser.objects.get(pk=kwargs.get('pk'))
            logout(request)
            login(request, user)
            return Response({"status": "OK"},
                            status=status.HTTP_200_OK)
        else:
            return Response(
                data={"error": "У вас нет прав для авторизации под "
                               "этим пользователем"},
                status=status.HTTP_403_FORBIDDEN
            )


class TelegramLoginPageView(TemplateView):
    template_name = "telegram_login.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Авторизация'}
        return render(request, self.template_name, context)


class WelcomeURLAPIView(CanGetWelcomeURLMixin, APIView):
    def get(self, request, *args, **kwargs):
        try:
            user = NewUser.objects.get(pk=kwargs.get('pk'))
        except NewUser.DoesNotExist:
            return Response(data={"error": "Пользователь не найден"},
                            status=status.HTTP_404_NOT_FOUND)
        return Response(data=user.get_welcome_url(),
                        status=status.HTTP_200_OK)


class WelcomeURLPatchAPIView(APIView):
    def validate_data(self):
        data = self.request.data
        errors = {"count": 0, "first_name": [], "last_name": [], "email": [], "password": [], "patronymic": []}
        if data.get('first_name') is None or not len(data.get('first_name')):
            errors["first_name"].append("Поле обязательно к заполнению")
            errors["count"] += 1
        else:
            if len(data.get('first_name')) > 50:
                errors["first_name"].append("Поле не может превышать 50 символов")
                errors["count"] += 1
        if data.get('last_name') is None or not len(data.get('last_name')):
            errors["last_name"].append("Поле обязательно к заполнению")
            errors["count"] += 1
        else:
            if len(data.get('last_name')) > 50:
                errors["last_name"].append("Поле не может превышать 50 символов")
                errors["count"] += 1
        if data.get('patronymic') and len(data.get('patronymic')) > 50:
            errors["patronymic"].append("Поле не может превышать 50 символов")
            errors["count"] += 1
        if data.get('email'):
            try:
                validate_email(data.get('email'))
            except ValidationError:
                errors["email"].append("Некорректный email")
                errors["count"] += 1
        if data.get('password') is None or not len(data.get('password')):
            errors["password"].append("Поле обязательно к заполнению")
            errors["count"] += 1
        else:
            try:
                validate_password(data.get('password'))
            except ValidationError as ex:
                errors["password"] = ex.messages
                errors["count"] += 1
        return errors

    def patch(self, request, *args, **kwargs):
        user = NewUser.objects.filter(registration_url=kwargs.get("welcome_url"),
                                      registration_url_access__gte=timezone.now()).first()
        if user is None:
            return Response(data={"error": "Пользователь не найден"},
                            status=status.HTTP_404_NOT_FOUND)
        validation = self.validate_data()
        if validation["count"]:
            return Response(data={"errors": validation},
                            status=status.HTTP_400_BAD_REQUEST)
        user.first_name = request.data.get('first_name')
        user.last_name = request.data.get('last_name')
        user.patronymic = request.data.get('patronymic')
        user.bdate = request.data.get('bdate')
        user.set_password(request.data.get('password'))
        user.registration_url = None
        user.registration_url_access = None
        user.save()
        login(request, user)
        return Response(data={"status": "ok"},
                        status=status.HTTP_200_OK)


class WelcomePageTemplateView(TemplateView):
    def get_template_names(self, success=True):
        if success:
            return "welcome/welcome_success.html"
        return "welcome/welcome_error.html"

    def get(self, request, *args, **kwargs):
        user = NewUser.objects.filter(registration_url=kwargs.get("welcome_url"),
                                      registration_url_access__gte=timezone.now()).first()
        if user:
            context = {'title': 'Добро пожаловать!',
                       'tg_nickname': 'kitai_school_study_bot',
                       'user': user}
            template = self.get_template_names()
        else:
            context = {'title': 'Ошибка'}
            template = self.get_template_names(False)
        return render(request, template, context)
