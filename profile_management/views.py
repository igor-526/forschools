from django.contrib.auth.decorators import permission_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic import TemplateView
from django.contrib.auth import authenticate, login, logout
from rest_framework.generics import RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from .forms import SignUpForm
from .models import (NewUser,
                     EngagementChannel,
                     Level,
                     Programs)
from .serializers import (NewUserSerializer,
                          NewUserProfileSerializer,
                          EngagementChannelSerializer,
                          ProgramSerializer,
                          LevelSerializer)


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


@permission_required(perm='auth.register_listener', raise_exception=True)
def register_view(request):     # API для регистрации пользователей
    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.update_tg_code()
            user.set_group(request.POST.get('role'))
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse(form.errors, status=400)


class DashboardPage(LoginRequiredMixin, TemplateView):    # главная страница Dashboard
    template_name = "profile.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Дэшборд'}
        return render(request, self.template_name, context)


class UsersPage(LoginRequiredMixin, TemplateView):  # страница пользователей (администрирование)
    template_name = "users.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Пользователи'}
        return render(request, self.template_name, context)


class UserListAPIView(LoginRequiredMixin, ListAPIView):     # API для вывода списка пользователей
    serializer_class = NewUserSerializer

    def get_queryset(self):
        group = self.request.query_params.get('group')
        if not group:
            return NewUser.objects.all()
        elif group == 'listeners':
            return NewUser.objects.filter(groups__name='Listener')
        elif group == 'teachers':
            return NewUser.objects.filter(
                Q(groups__name='Teacher') | Q(groups__name='Metodist') | Q(groups__name='Admin'))

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = NewUserSerializer(queryset, many=True)
        return Response(serializer.data)


class UserAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):    # API для вывода, изменения и удаления пользователя
    queryset = NewUser.objects.all()
    serializer_class = NewUserProfileSerializer

    def patch(self, request, *args, **kwargs):
        data = request.data
        user = self.get_object()
        user.set_group(data.get('role'))
        en_ch = data.get('eng_channel_new') if data.get(
            'eng_channel_new') else data.get('eng_channel')
        lvl = data.get('lvl_new') if data.get('lvl_new') else data.get('lvl')
        user.set_engagement_channel(en_ch)
        if lvl:
            user.set_level(lvl)
        user.set_programs(data.getlist('prog'), data.get('prog_new'))
        user.set_lessons_type(
            data.get('private_lessons'),
            data.get('group_lessons')
        )
        return super(UserAPIView, self).patch(request, *args, **kwargs)


class UserPhotoApiView(APIView):    # API для получения, изменения и обновления фото
    def get(self, request, *args, **kwargs):
        user = NewUser.objects.get(pk=kwargs.get('pk'))
        return JsonResponse({'photo': user.photo.url})

    def patch(self, request, *args, **kwargs):
        data = request.data
        user = NewUser.objects.get(pk=kwargs.get('pk'))
        user.photo = data.get('photo')
        user.save()
        return JsonResponse({"status": "success"})

    def delete(self, request, *args, **kwargs):
        user = NewUser.objects.get(pk=kwargs.get('pk'))
        user.delete_photo()
        return JsonResponse({"status": "success"})


class EngagementListAPIView(LoginRequiredMixin, ListAPIView):   # API для вывода каналов привлечения
    queryset = EngagementChannel.objects.all()
    serializer_class = EngagementChannelSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = EngagementChannelSerializer(queryset, many=True)
        return Response(serializer.data)


class LevelListAPIView(LoginRequiredMixin, ListAPIView):    # API для вывода уровней
    queryset = Level.objects.all()
    serializer_class = LevelSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = LevelSerializer(queryset, many=True)
        return Response(serializer.data)


class ProgramListAPIView(LoginRequiredMixin, ListAPIView):  # API для вывода программ обучения
    queryset = Programs.objects.all()
    serializer_class = ProgramSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = ProgramSerializer(queryset, many=True)
        return Response(serializer.data)
