import datetime
from pprint import pprint

from lesson.permissions import CanReplaceTeacherMixin, replace_teacher_button
from .serializers import HomeworkListSerializer, HomeworkLogSerializer
from rest_framework.generics import ListCreateAPIView, ListAPIView
from tgbot.utils import send_homework_tg, send_homework_edit
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView
from rest_framework.response import Response
from .models import Homework, HomeworkLog
from dls.settings import MATERIAL_FORMATS
from rest_framework.views import APIView
from django.http import JsonResponse
from django.shortcuts import render
from rest_framework import status
from material.models import File
from dls.utils import get_menu


class HomeworksPage(LoginRequiredMixin, TemplateView):  # страница домашних заданий
    template_name = "homeworks.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Домашние задания',
                   'menu': get_menu(request.user),
                   'can_add_hw': True,
                   'is_admin_or_metodist': request.user.groups.filter(name__in=["Admin", "Metodist"]).exists(),
                   'is_teacher': request.user.groups.filter(name="Teacher").exists(),
                   'is_listener': request.user.groups.filter(name="Listener").exists(),
                   'material_formats': MATERIAL_FORMATS}
        return render(request, self.template_name, context)


class HomeworkListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
    model = Homework
    serializer_class = HomeworkListSerializer

    def filter_queryset_teacher(self, queryset):
        teachers = self.request.query_params.getlist("teacher")
        if teachers:
            queryset = queryset.filter(teacher__id__in=teachers)
        return queryset

    def filter_queryset_listener(self, queryset):
        listeners = self.request.query_params.getlist("listener")
        if listeners:
            queryset = queryset.filter(listener__id__in=listeners)
        return queryset

    def filter_queryset_lesson(self, queryset):
        lesson = self.request.query_params.get("lesson")
        if lesson:
            queryset = queryset.filter(lesson=lesson)
        return queryset

    def filter_queryset_assigned(self, queryset):
        assigned_date_from = self.request.query_params.get("date_from")
        assigned_date_to = self.request.query_params.get("date_to")
        if assigned_date_from or assigned_date_to:
            listed_queryset = list(queryset)
            listed_queryset = list(filter(lambda hw: hw.get_status(True) is not None, listed_queryset))
            if assigned_date_from:
                assigned_date_from = datetime.datetime.strptime(assigned_date_from, "%Y-%m-%d").date()
                listed_queryset = list(filter(lambda hw: hw.get_status(True).dt.date() >= assigned_date_from,
                                              listed_queryset))
            if assigned_date_to:
                assigned_date_to = datetime.datetime.strptime(assigned_date_to, "%Y-%m-%d").date()
                listed_queryset = list(filter(lambda hw: hw.get_status(True).dt.date() <= assigned_date_to,
                                              listed_queryset))
            queryset = queryset.filter(id__in=[hw.id for hw in listed_queryset])
        return queryset

    def filter_queryset_status(self, queryset):
        hw_status = self.request.query_params.get("status")
        if hw_status:
            filtering_statuses = []
            if hw_status == '7':
                filtering_statuses = [7, 2, 5]
            if hw_status == '3':
                filtering_statuses = [3]
            if hw_status == '4':
                filtering_statuses = [4, 6]
            listed_queryset = [{"id": hw.id,
                                "status": hw.get_status().status} for hw in queryset]
            filtered_queryset = list(filter(lambda hw: hw.get("status") in filtering_statuses, listed_queryset))
            queryset = Homework.objects.filter(id__in=[hw.get("id") for hw in filtered_queryset])
        return queryset

    def get_queryset(self, *args, **kwargs):
        group = kwargs.get("user").groups.first().name
        if group == "Teacher":
            queryset = Homework.objects.filter(teacher=kwargs.get("user"))
        elif group == "Listener":
            queryset = Homework.objects.filter(listener=kwargs.get("user"))
        else:
            queryset = Homework.objects.all()
        # st_filtered = []
        # print(hw_status)
        # if hw_status == "7":
        #     print("selected 7")
        #     for hw in queryset:
        #         status = hw.get_status()
        #         print(status.status)
        #         if status.status in [7, 2, 5]:
        #             st_filtered.append(status.homework.id)
        # elif hw_status == "3":
        #     print("selected 3")
        #     for hw in queryset:
        #         status = hw.get_status()
        #         print(status.status)
        #         if status.status == 3:
        #             st_filtered.append(status.homework.id)
        # elif hw_status == "4":
        #     print("selected 4")
        #     for hw in queryset:
        #         status = hw.get_status()
        #         print(status.status)
        #         if status.status in [4, 6]:
        #             st_filtered.append(status.homework.id)
        # if st_filtered:
        #     queryset = queryset.filter(id__in=st_filtered)
        queryset = self.filter_queryset_lesson(queryset)
        queryset = self.filter_queryset_teacher(queryset)
        queryset = self.filter_queryset_listener(queryset)
        queryset = self.filter_queryset_assigned(queryset)
        queryset = self.filter_queryset_status(queryset)
        return queryset[:50]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset(status=request.query_params.get('status'),
                                     user=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data,
                                         context={'request': request})
        serializer.is_valid(raise_exception=True)
        hw = serializer.save()
        lesson = hw.lesson_set.first()
        if lesson:
            if lesson.status == 1:
                send_homework_tg(request.user, hw.listener, [hw])
                hw.set_assigned()
        else:
            send_homework_tg(request.user, hw.listener, [hw])
        return Response(serializer.data, status.HTTP_201_CREATED)


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


class HomeworkItemPageInfoAPIView(LoginRequiredMixin, APIView):
    def get(self, request, *args, **kwargs):
        hw = Homework.objects.get(pk=kwargs.get('pk'))
        status = hw.get_status().status
        can_edit = (hw.teacher == request.user or
                             request.user.groups.filter(name__in=["Metodist", "Admin"]).exists())
        can_add_materials_tg = can_edit and request.user.telegram.exists()
        return JsonResponse({
            "status": status,
            "can_edit": can_edit,
            "can_add_materials_tg": can_add_materials_tg
        })


class HomeworkItemPageEditAPIView(LoginRequiredMixin, APIView):
    def get(self, request, *args, **kwargs):
        hw = Homework.objects.get(pk=kwargs.get('pk'))
        send_homework_edit(hw, request.user)
        return JsonResponse({})


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


class UserHWListAPIView(LoginRequiredMixin, ListAPIView):
    serializer_class = HomeworkListSerializer

    def get_queryset(self, *args, **kwargs):
        userID = self.kwargs.get('pk')
        return Homework.objects.filter(listener__id=userID)


class HomeworkSetCancelledAPIView(LoginRequiredMixin, APIView):
    def post(self, request, *args, **kwargs):
        try:
            hw = Homework.objects.get(pk=kwargs.get('pk'))
        except Homework.DoesNotExist:
            return JsonResponse({'status': 'Ошибка! ДЗ не найдено'}, status=status.HTTP_400_BAD_REQUEST)
        if hw.get_status().status in [4, 6]:
            return JsonResponse({'status': 'Невозможно отменить ДЗ, так как оно либо принято, либо уже отменено'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            HomeworkLog.objects.create(
                homework=hw,
                user=request.user,
                comment="Домшнее задание отменено",
                status=6
            )
            return JsonResponse({'status': 'ok'}, status=status.HTTP_200_OK)


