from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic import TemplateView
from django.contrib.auth import authenticate, login, logout
from .forms import SignUpForm


def user_login(request):    # страница авторизации и логин
    if request.POST:
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
    return render(request, 'login.html')


def user_logout(request):    # логаут
    logout(request)
    return HttpResponseRedirect(reverse_lazy('login'))


class ProfilePage(LoginRequiredMixin, TemplateView):    # страница профиля
    template_name = "profile.html"

    def get(self, request, *args, **kwargs):
        context = {}
        return render(request, self.template_name, context)


class RegisterPage(LoginRequiredMixin, TemplateView):    # страница регистрации профиля
    template_name = "register.html"

    def get(self, request, *args, **kwargs):
        context = {"reg_listener": True if request.user.role < 4 else False,
                   "reg_metodist": True if request.user.role < 3 else False,
                   "reg_admin": True if request.user.role < 2 else False}
        return render(request, self.template_name, context)


def register_view(request):
    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.update_tg_code()
    else:
        form = SignUpForm()
    return render(request, "register.html", {"form": form})

