from django.contrib.auth.decorators import permission_required
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
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


@permission_required(perm='auth.register_listener', raise_exception=True)
def register_view(request):     # Страница регистрации других профилей
    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.update_tg_code()
    else:
        form = SignUpForm()
        return render(request, "register.html", {"form": form})


class TelegramPage(LoginRequiredMixin, TemplateView):    # страница привязки Telegram
    template_name = "telegram.html"

    def get(self, request, *args, **kwargs):
        if not request.user.tg_code:
            request.user.update_tg_code()
        context = {"code": request.user.tg_code}
        return render(request, self.template_name, context)
