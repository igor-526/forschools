import datetime

from django.db.models import Q

from chat.models import Message
from lesson.permissions import CanReplaceTeacherMixin, replace_teacher_button
from .permissions import get_delete_log_permission, get_send_hw_permission, get_can_check_hw_permission, \
    get_can_cancel_hw_permission, get_can_accept_log_permission
from .serializers import HomeworkListSerializer, HomeworkLogListSerializer, HomeworkLogSerializer
from rest_framework.generics import ListCreateAPIView, ListAPIView, RetrieveDestroyAPIView
from tgbot.utils import send_homework_tg, send_homework_edit, notify_chat_message, send_homework_answer_tg
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


class HomeworksPage(LoginRequiredMixin, TemplateView):
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
        if queryset is None:
            return None
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
        queryset = None
        if kwargs.get("user").groups.filter(name="Admin").exists():
            queryset = Homework.objects.all()
        elif kwargs.get("user").groups.filter(name="Metodist").exists():
            queryset = Homework.objects.filter(lesson__learningphases__learningplan__metodist=kwargs.get("user"))
        elif kwargs.get("user").groups.filter(name="Teacher").exists():
            queryset = Homework.objects.filter(teacher=kwargs.get("user"))
        elif kwargs.get("user").groups.filter(name="Listener").exists():
            queryset = Homework.objects.filter(listener=kwargs.get("user"))
        if kwargs.get("user").groups.filter(name="Curator").exists():
            if queryset is not None:
                queryset = Homework.objects.filter(Q(lesson__learningphases__learningplan__curators=self.request.user) |
                                                   Q(id__in=[h.id for h in queryset]))
            else:
                queryset = Homework.objects.filter(lesson__learningphases__learningplan__curators=self.request.user)
        queryset = self.filter_queryset_lesson(queryset)
        queryset = self.filter_queryset_teacher(queryset)
        queryset = self.filter_queryset_listener(queryset)
        queryset = self.filter_queryset_assigned(queryset)
        queryset = self.filter_queryset_status(queryset)
        return queryset[:50] if queryset is not None else None

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset(status=request.query_params.get('status'),
                                     user=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data,
                                         context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status.HTTP_201_CREATED)


class HomeworkItemPage(LoginRequiredMixin, TemplateView):
    template_name = "homework_item.html"

    def get(self, request, *args, **kwargs):
        hw = Homework.objects.get(pk=kwargs.get('pk'))
        hw_status = hw.get_status().status
        if hw_status == 1 and hw.listener == request.user:
            hw.open()
        context = {'title': hw.name,
                   'menu': get_menu(request.user),
                   "hw": hw,
                   "can_send": get_send_hw_permission(hw, request),
                   "can_check": get_can_check_hw_permission(hw, request),
                   "can_cancel": get_can_cancel_hw_permission(hw, request),
                   "can_set_replace": replace_teacher_button(request)}
        return render(request, self.template_name, context)


class HomeworkItemPageInfoAPIView(LoginRequiredMixin, APIView):
    def get(self, request, *args, **kwargs):
        hw = Homework.objects.get(pk=kwargs.get('pk'))
        hw_status = hw.get_status().status
        can_edit = (hw.teacher == request.user or
                    request.user.groups.filter(name__in=["Metodist", "Admin"]).exists())
        can_add_materials_tg = can_edit and request.user.telegram.exists()
        return JsonResponse({
            "status": hw_status,
            "can_edit": can_edit,
            "can_add_materials_tg": can_add_materials_tg,
            "can_answer_logs": get_can_accept_log_permission(hw, request)
        })


class HomeworkItemPageEditAPIView(LoginRequiredMixin, APIView):
    def get(self, request, *args, **kwargs):
        hw = Homework.objects.get(pk=kwargs.get('pk'))
        send_homework_edit(hw, request.user)
        return JsonResponse({})


class HomeworkLogListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
    model = HomeworkLog

    def get_last_logs(self, queryset, *args, **kwargs):
        last_logs = []
        for log in queryset.filter(status__in=[3, 4, 5]):
            if last_logs:
                if last_logs[-1]['status'] == log.status:
                    last_logs.append({'id': log.id,
                                      'status': log.status})
                else:
                    break
            else:
                last_logs.append({'id': log.id,
                                  'status': log.status})
        queryset = HomeworkLog.objects.filter(id__in=[log["id"] for log in last_logs]).order_by('-dt')
        return queryset

    def get_queryset(self, *args, **kwargs):
        queryset = HomeworkLog.objects.filter(homework_id=kwargs.get('pk'))
        last = self.request.query_params.get('last')
        if last is not None:
            queryset = self.get_last_logs(queryset)
        return queryset

    def get_serializer_class(self):
        last = self.request.query_params.get('last')
        if last is not None:
            return HomeworkLogSerializer
        else:
            return HomeworkLogListSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset(*args, **kwargs)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        files = []
        if request.data.getlist('files') and len(request.data.getlist('files')[0]) > 0:
            for file in request.data.getlist('files'):
                f = File.objects.create(path=file,
                                        owner=request.user,
                                        name=file)
                files.append(f.id)
        serializer = self.get_serializer(data=request.data,
                                         context={'request': request,
                                                  'files': files,
                                                  'hw_id': kwargs.get('pk')})
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()
        except Exception as e:
            print(e)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class HomeworkLogAPIView(LoginRequiredMixin, RetrieveDestroyAPIView):
    model = HomeworkLog
    serializer_class = HomeworkLogSerializer

    def get_queryset(self, *args, **kwargs):
        return HomeworkLog.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance:
            if get_delete_log_permission(instance, request):
                instance.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def post(self, request, *args, **kwargs):
        instance = self.get_object()
        if not get_can_accept_log_permission(instance.homework, request):
            return Response(status=status.HTTP_403_FORBIDDEN)
        if instance:
            agreement = {
                "accepted_dt": None,
                "accepted": False
            }
            if request.POST.get('action') == 'accept':
                agreement['accepted'] = True
                if instance.status == 7:
                    teacher_msg_text = "Домашнее задание согласовано и задано"
                    send_homework_tg(initiator=instance.homework.teacher,
                                     listener=instance.homework.listener,
                                     homeworks=[instance.homework])
                elif instance.status == 4:
                    teacher_msg_text = "Ответ на решение согласован. ДЗ принято"
                    send_homework_answer_tg(instance.homework.listener, instance.homework, 4)
                elif instance.status == 5:
                    teacher_msg_text = "Ответ на решение согласован. ДЗ отправлено на доработку"
                    send_homework_answer_tg(instance.homework.listener, instance.homework, 5)
                else:
                    teacher_msg_text = "Домашнее задание согласовано"
                send_homework_tg(initiator=instance.homework.get_lesson().get_learning_plan().metodist,
                                 listener=instance.homework.teacher,
                                 homeworks=[instance.homework],
                                 text=teacher_msg_text)
            elif request.POST.get('action') == 'decline':
                agreement['accepted'] = False
                send_homework_edit(instance.homework, instance.homework.teacher)
            if request.POST.get('message'):
                agreement['message'] = request.POST.get('message')
                message = Message.objects.create(sender=request.user,
                                                 receiver=instance.homework.teacher,
                                                 message=request.POST.get('message'))
                notify_chat_message(message)

            instance.agreement = agreement
            instance.save()
            return Response(data={'status': True}, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)


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
        user_id = self.kwargs.get('pk')
        return Homework.objects.filter(listener__id=user_id)


class HomeworkSetCancelledAPIView(LoginRequiredMixin, APIView):
    def post(self, request, *args, **kwargs):
        try:
            hw = Homework.objects.get(pk=kwargs.get('pk'))
        except Homework.DoesNotExist:
            return JsonResponse({'status': 'Ошибка! ДЗ не найдено'}, status=status.HTTP_404_NOT_FOUND)
        if hw.get_status().status in [4, 6]:
            return JsonResponse({'status': 'Невозможно отменить ДЗ, так как оно либо принято, либо уже отменено'},
                                status=status.HTTP_400_BAD_REQUEST)
        else:
            hl = HomeworkLog.objects.create(
                homework=hw,
                user=request.user,
                comment="Домашнее задание отменено",
                status=6
            )
            serializer = HomeworkLogSerializer(hl, many=False, context={'request': request})
            return JsonResponse({'status': 'ok', 'log': serializer.data}, status=status.HTTP_200_OK)
