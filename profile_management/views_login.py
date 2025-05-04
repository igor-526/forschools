from django.contrib.auth.decorators import permission_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse_lazy
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from django.views.generic import TemplateView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .forms import SignUpForm
from .models import NewUser
from rest_framework.decorators import api_view


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


def user_login(request):
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
