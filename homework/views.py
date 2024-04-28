from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import Http404, JsonResponse
from rest_framework.views import APIView

from lesson.permissions import CanReplaceTeacherMixin, replace_teacher_button
from material.models import File
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework.generics import ListCreateAPIView
from .models import Homework, HomeworkLog
from .serializers import HomeworkListSerializer, HomeworkLogSerializer
from rest_framework import status
from rest_framework.response import Response
from dls.utils import get_menu


class HomeworksPage(LoginRequiredMixin, TemplateView):  # страница домашних заданий
    template_name = "homeworks.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Домашние задания',
                   'menu': get_menu(request.user),
                   'can_add_hw': True,
                   'is_admin_or_metodist': request.user.groups.filter(name__in=["Admin", "Metodist"]).exists(),
                   'is_teacher': request.user.groups.filter(name="Teacher").exists(),
                   'is_listener': request.user.groups.filter(name="Listener").exists()}
        return render(request, self.template_name, context)


class HomeworkListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
    model = Homework
    serializer_class = HomeworkListSerializer

    def get_queryset(self, *args, **kwargs):
        hw_status = kwargs.get("status")
        group = kwargs.get("user").groups.first().name
        if group == "Teacher":
            queryset = Homework.objects.filter(teacher=kwargs.get("user"))
        elif group == "Listener":
            queryset = Homework.objects.filter(listener=kwargs.get("user"))
        else:
            queryset = Homework.objects.all()
        st_filtered = []
        if hw_status == "1":
            for hw in queryset:
                status = hw.get_status()
                if status.status in [1, 2, 5]:
                    st_filtered.append(status.homework.id)
        if hw_status == "3":
            for hw in queryset:
                status = hw.get_status()
                if status.status == 3:
                    st_filtered.append(status.homework.id)
        if hw_status == "4":
            for hw in queryset:
                status = hw.get_status()
                if status.status in [4, 6]:
                    st_filtered.append(status.homework.id)
        queryset = queryset.filter(id__in=st_filtered)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset(status=request.query_params.get('status'),
                                     user=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class HomeworkItemPage(LoginRequiredMixin, TemplateView):
    template_name = "homework_item.html"

    def get(self, request, *args, **kwargs):
        hw = Homework.objects.get(pk=kwargs.get('pk'))
        status = hw.get_status().status
        if status == 1 and hw.listener == request.user:
            hw.open()
        context = {'title': hw.name,
                   'menu': get_menu(request.user),
                   "hw": hw,
                   "can_send": (status == 1 or status == 2 or status == 5) and hw.listener == request.user,
                   "can_check": status == 3 and hw.teacher == request.user,
                   "can_set_replace": replace_teacher_button(request)}
        return render(request, self.template_name, context)


class HomeworkLogListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
    model = HomeworkLog
    serializer_class = HomeworkLogSerializer

    def get_queryset(self, *args, **kwargs):
        return HomeworkLog.objects.filter(homework_id=kwargs.get('pk'))

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset(*args, **kwargs)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        files = []
        if len(request.data.getlist('files')[0]) > 0:
            for file in request.data.getlist('files'):
                f = File.objects.create(path=file,
                                        owner=request.user,
                                        name=file)
                files.append(f.id)
        request_copy = request.data.copy()
        request_copy['homework'] = kwargs.get('pk')
        serializer = self.get_serializer(data=request_copy,
                                         context={'request': request,
                                                  'files': files,
                                                  'user': request.user})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class HomeworkReplaceTeacher(CanReplaceTeacherMixin, APIView):
    def patch(self, request, *args, **kwargs):
        try:
            hw = Homework.objects.get(pk=kwargs.get("pk"))
            hw.teacher_id = request.data.get('teacher_id')
            hw.save()
            return JsonResponse({'status': 'ok'}, status=status.HTTP_200_OK)
        except Homework.DoesNotExist:
            return JsonResponse({'error': 'ДЗ не найдено'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
