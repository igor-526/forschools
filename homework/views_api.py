import datetime
from django.db.models import Q, QuerySet
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework.generics import (ListCreateAPIView,
                                     ListAPIView,
                                     RetrieveUpdateDestroyAPIView)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from chat.models import Message
from lesson.models import Lesson
from lesson.permissions import CanReplaceTeacherMixin
from material.models import File, Material
from material.utils import get_type_by_ext
from profile_management.models import NewUser
from tgbot.funcs.homeworks.homework_show import open_homework_in_tg, send_link_to_tg
from tgbot.utils import (send_homework_tg,
                         send_homework_answer_tg, sync_funcs)
from chat.tg_utils import tg_sync_chat_funcs
from user_logs.models import UserLog
from .models import Homework, HomeworkLog
from .utils import status_code_to_string
from .permissions import (get_delete_log_permission,
                          get_can_accept_log_permission,
                          get_can_edit_hw_permission)
from .serializers import (HomeworkListSerializer, HomeworkLogListSerializer,
                          HomeworkLogSerializer, HomeworkSerializer)
from rest_framework.request import Request


class HomeworkListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
    model = Homework
    serializer_class = HomeworkListSerializer

    def filter_queryset_date_assigned(self, queryset):
        if queryset:
            assigned_date_from = self.request.query_params.get("date_from")
            assigned_date_to = self.request.query_params.get("date_to")
            if assigned_date_from or assigned_date_to:
                listed_queryset = list(queryset)
                listed_queryset = list(filter(
                    lambda hw: hw.get_status(True) is not None,
                    listed_queryset
                ))
                if assigned_date_from:
                    assigned_date_from = datetime.datetime.strptime(
                        assigned_date_from,
                        "%Y-%m-%d"
                    ).date()
                    listed_queryset = list(filter(
                        lambda hw: (hw.get_status(True).dt.date() >=
                                    assigned_date_from),
                        listed_queryset
                    ))
                if assigned_date_to:
                    assigned_date_to = datetime.datetime.strptime(
                        assigned_date_to,
                        "%Y-%m-%d"
                    ).date()
                    listed_queryset = list(filter(
                        lambda hw: (hw.get_status(True).dt.date() <=
                                    assigned_date_to),
                        listed_queryset
                    ))
                queryset = queryset.filter(
                    id__in=[hw.id for hw in listed_queryset]
                )
            return queryset
        return None

    def filter_queryset_date_changed(self, queryset):
        if queryset:
            date_changed_from = self.request.query_params.get(
                "date_changed_from"
            )
            date_changed_to = self.request.query_params.get(
                "date_changed_to"
            )
            if date_changed_from or date_changed_to:
                listed_queryset = list(queryset)
                listed_queryset = list(filter(
                    lambda hw: hw.get_status(True) is not None,
                    listed_queryset
                ))
                if date_changed_from:
                    date_changed_from = datetime.datetime.strptime(
                        date_changed_from,
                        "%Y-%m-%d"
                    ).date()
                    listed_queryset = list(filter(
                        lambda hw: (hw.get_status().dt.date() >=
                                    date_changed_from),
                        listed_queryset
                    ))
                if date_changed_to:
                    date_changed_to = datetime.datetime.strptime(
                        date_changed_to,
                        "%Y-%m-%d"
                    ).date()
                    listed_queryset = list(filter(
                        lambda hw: (hw.get_status().dt.date() <=
                                    date_changed_to),
                        listed_queryset
                    ))
                queryset = queryset.filter(
                    id__in=[hw.id for hw in listed_queryset]
                )
            return queryset
        return None

    def filter_queryset_status(self, queryset):
        if queryset:
            hw_status = self.request.query_params.getlist("status")
            if hw_status:
                hw_status = [int(s) for s in hw_status]
                listed_queryset = [{
                    "id": hw.id,
                    "status": hw.get_status(
                        accepted_only=self.request.user == hw.listener
                    ).status
                }
                    for hw in queryset]
                listed_queryset = list(filter(
                    lambda hw: hw.get("status") in hw_status,
                    listed_queryset
                ))
                queryset = queryset.filter(id__in=[hw.get("id") for hw in
                                                   listed_queryset])
            return queryset
        return None

    def filter_queryset_agreement(self, queryset):
        if queryset:
            hw_agreement = self.request.query_params.getlist("agreement")
            if hw_agreement:
                agreement_filter_perm = self.request.user.groups.filter(
                    name__in=['Curator', 'Teacher', 'Metodist', 'Admin']
                ).exists()
                if not agreement_filter_perm:
                    return queryset
                listed_queryset = [{"id": hw.id,
                                    "agreement": hw.get_status().agreement}
                                   for hw in queryset]
                filtered_queryset = []
                if "not_accepted" in hw_agreement:
                    filtered_queryset.extend(list(filter(
                        lambda hw: (hw.get("agreement").get("accepted")
                                    is False),
                        listed_queryset
                    )))
                if "accepted" in hw_agreement:
                    filtered_queryset.extend(list(filter(
                        lambda hw: (hw.get("agreement").get("accepted")
                                    is True),
                        listed_queryset
                    )))
                if "no_need" in hw_agreement:
                    filtered_queryset.extend(list(filter(
                        lambda hw: hw.get("agreement") == {},
                        listed_queryset
                    )))
                queryset = queryset.filter(
                    id__in=[hw.get("id") for hw in filtered_queryset]
                )
            return queryset
        return None

    def filter_queryset_all(self, queryset):
        query = {}
        teachers = self.request.query_params.getlist("teacher")
        listeners = self.request.query_params.getlist("listener")
        lesson = self.request.query_params.get("lesson")
        name = self.request.query_params.get("hw_name")
        if teachers:
            query['teacher__id__in'] = teachers
        if listeners:
            query['listener__id__in'] = listeners
        if lesson:
            query['lesson'] = lesson
        if name:
            query['name__icontains'] = name
        queryset = queryset.filter(**query)
        queryset = self.filter_queryset_date_assigned(queryset)
        queryset = self.filter_queryset_date_changed(queryset)
        queryset = self.filter_queryset_status(queryset)
        queryset = self.filter_queryset_agreement(queryset)
        offset = int(self.request.query_params.get("offset")) if (
            self.request.query_params.get("offset")) else 0
        return queryset[offset:offset + 50] if queryset else None

    def get_queryset(self, *args, **kwargs):
        user_groups = [group.name for group in self.request.user.groups.all()]
        q = Q()
        if "Admin" in user_groups:
            return self.filter_queryset_all(Homework.objects.all())
        if "Metodist" in user_groups:
            q |= Q(lesson__learningphases__learningplan__metodist=
                   self.request.user)
        if "Teacher" in user_groups:
            q |= Q(teacher=self.request.user)
        if "Listener" in user_groups:
            q |= Q(listener=self.request.user)
        if "Curator" in user_groups:
            q |= Q(lesson__learningphases__learningplan__curators=
                   self.request.user)
        return self.filter_queryset_all(Homework.objects.filter(q))

    def create(self, request, *args, **kwargs):
        tg_id = request.POST.get("tg_id")
        lesson_id = request.POST.get("lesson_id")
        if tg_id and lesson_id:
            result = sync_funcs.add_hw(tg_id, lesson_id)
            if result['status'] is False:
                return Response(data={"status": "error",
                                      "error": result['error']},
                                status=status.HTTP_400_BAD_REQUEST)
            return Response(data={"status": "ok"},
                            status=status.HTTP_200_OK)
        name = f'ДЗ {Homework.objects.count() + 1}'
        serializer = self.get_serializer(data={"name": name,
                                               **request.data},
                                         context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status.HTTP_201_CREATED)


class HomeworkRetrieveUpdateDestroyAPIView(APIView):
    model = Homework
    serializer_class = HomeworkSerializer

    def get(self, request, *args, **kwargs):
        serializer = HomeworkSerializer(
            Homework.objects.get(pk=kwargs.get("pk")),
            many=False,
            context={"request": request}
        )
        return Response(serializer.data)


class HomeworkItemPageInfoAPIView(LoginRequiredMixin, APIView):
    def get(self, request, *args, **kwargs):
        hw = Homework.objects.get(pk=kwargs.get('pk'))
        hw_status = hw.get_status().status
        can_edit = (hw.teacher == request.user or
                    request.user.groups.filter(
                        name__in=["Metodist", "Admin"]
                    ).exists())
        can_add_materials_tg = can_edit and request.user.telegram.exists()
        return Response({
            "status": hw_status,
            "can_edit": can_edit,
            "can_add_materials_tg": can_add_materials_tg,
            "can_answer_logs": get_can_accept_log_permission(hw, request)
        })


# Deprecated
class HomeworkItemPageSendTGAPIView(LoginRequiredMixin, APIView):
    def get(self, request, *args, **kwargs):
        try:
            hw = Homework.objects.get(pk=kwargs.get('pk'))
        except Homework.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if request.query_params.get("tg_id"):
            tg_id = int(request.query_params.get("tg_id"))
        else:
            tg_note = request.user.telegram.filter(usertype="main").first()
            if not tg_note:
                return Response(data={"error": "Telegram не привязан"},
                                status=status.HTTP_400_BAD_REQUEST)
            tg_id = tg_note.tg_id
        open_homework_in_tg(tg_id, hw.id)
        return Response(data={"status": "ok"},
                        status=status.HTTP_200_OK)


class HomeworkItemPageSendTelegramAPIView(LoginRequiredMixin, APIView):
    def post(self, request: Request, pk: int, *args, **kwargs):
        try:
            homework = Homework.objects.get(pk=pk)
        except Homework.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        user_id = request.POST.get("user_id")
        if not user_id:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        try:
            user = NewUser.objects.get(pk=user_id)
        except NewUser.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        user_telegrams = user.telegram_allowed_user.filter(user=user).values_list("tg_id", flat=True)
        if not user_telegrams:
            return Response(data={"error": "Нет ни одного авторизованного под этим пользователем Telegram"},
                            status=status.HTTP_400_BAD_REQUEST)
        for tg_id in user_telegrams:
            if request.POST.get("method") == "open":
                open_homework_in_tg(tg_id, homework.id)
            else:
                send_link_to_tg(tg_id, homework.id, request.POST.get("message"))
        return Response(data={"status": "ok"},
                        status=status.HTTP_200_OK)


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
        queryset = HomeworkLog.objects.filter(
            id__in=[log["id"] for log in last_logs]).order_by('-dt')
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
        return HomeworkLogListSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset(*args, **kwargs)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        files = []
        if (request.data.getlist('files') and
                len(request.data.getlist('files')[0]) > 0):
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
        except Exception:
            pass
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class HomeworkLogAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    model = HomeworkLog
    serializer_class = HomeworkLogSerializer

    def get_queryset(self, *args, **kwargs):
        return HomeworkLog.objects.all()

    def get_files(self):
        result = []
        for file in self.request.data.getlist('files'):
            f = File.objects.create(
                owner=self.request.user,
                name=".".join(file.name.split(".")[:-1]),
                extension=file.name.split(".")[-1],
                is_animation=get_type_by_ext(file.name.split(".")[-1]) == "animation_formats",
                path=file
            )
            result.append(f.id)
        return result

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance:
            if get_delete_log_permission(instance, request):
                lesson = instance.homework.lesson_set.first()
                plan = lesson.get_learning_plan() if lesson else None
                if plan:
                    q = {
                        "log_type": 4,
                        "learning_plan": plan,
                        "title": f"Из ДЗ '{instance.homework.name}' удалён "
                                 f"статус",
                        "content": {
                            "list": [
                                {
                                    "name": "Наименование занятия",
                                    "val": lesson.name
                                },
                                {
                                    "name": "Дата занятия",
                                    "val": lesson.date.strftime("%d.%m.%Y")
                                },
                                {
                                    "name": "Статус",
                                    "val":
                                        status_code_to_string(instance.status)
                                },
                                {
                                    "name": "Дата присвоения статуса",
                                    "val": instance.dt.strftime("%d.%m.%Y")
                                }
                            ],
                            "text": [instance.comment] if instance.comment
                            else [],
                        },
                        "buttons": [
                            {"inner": "ДЗ",
                             "href": f"/homeworks/{instance.homework.id}"},
                            {"inner": "Занятие",
                             "href": f"/lessons/{lesson.id}"}
                        ],
                        "user": request.user,
                        "color": "danger"
                    }
                    ul = UserLog.objects.create(**q)
                    ul.files_db.add(*[
                        file.id for file in instance.files.all()
                    ])
                instance.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            return Response(status=status.HTTP_403_FORBIDDEN)
        return Response(status=status.HTTP_404_NOT_FOUND)

    def post(self, request, *args, **kwargs):
        instance = self.get_object()
        if not get_can_accept_log_permission(instance.homework, request):
            return Response(status=status.HTTP_403_FORBIDDEN)
        if instance:
            if instance.status == 7:
                hw_group = instance.homework.homeworkgroups_set.first()
                hws = hw_group.homeworks.all() if hw_group \
                    else [instance.homework]
            else:
                hws = [instance.homework]
            to_agreement = HomeworkLog.objects.filter(
                homework__id__in=[hw.id for hw in hws],
                dt__lte=instance.dt,
                agreement__accepted=False
            )
            accepted_dt = datetime.datetime.now()
            lesson = hws[0].lesson_set.first()
            agreement = {
                "accepted_dt": {
                    "year": accepted_dt.year,
                    "month": accepted_dt.month,
                    "day": accepted_dt.day,
                    "hour": accepted_dt.hour,
                    "minute": accepted_dt.minute
                },
                "accepted": False
            }
            user_log = {
                "log_type": 1,
                "learning_plan": lesson.get_learning_plan(),
                "content": {"list": [],
                            "text": [
                                f'Методист обработал действие преподавателя '
                                f'по ДЗ к занятию '
                                f'"{lesson.name}" от '
                                f'{lesson.date.strftime("%d.%m.%Y")}',
                                f'Проверяющий ДЗ: {hws[0].teacher.first_name} '
                                f'{hws[0].teacher.last_name}'
                            ]},
                "user": request.user,
                "buttons": []}
            if request.POST.get('action') == 'accept':
                agreement['accepted'] = True
                user_log["title"] = "Действие преподавателя согласовано"
                user_log["color"] = "info"
                if instance.status == 7:
                    for hw in hws:
                        send_homework_tg(
                            initiator=instance.homework.teacher,
                            listener=instance.homework.listener,
                            homeworks=[hw]
                        )
                    send_homework_tg(
                        initiator=instance.homework.get_lesson()
                        .get_learning_plan().metodist,
                        listener=instance.homework.teacher,
                        homeworks=hws,
                        text="Следующие ДЗ были согласованы и заданы"
                    )
                else:
                    if instance.status == 4:
                        teacher_msg_text = ("Ответ на решение согласован. "
                                            "ДЗ принято")
                        send_homework_answer_tg(instance.homework.listener,
                                                hws[0], 4)
                    elif instance.status == 5:
                        teacher_msg_text = ("Ответ на решение согласован. "
                                            "ДЗ отправлено на доработку")
                        send_homework_answer_tg(instance.homework.listener,
                                                hws[0], 5)
                    else:
                        teacher_msg_text = "Домашнее задание согласовано"
                    send_homework_tg(initiator=instance.homework.get_lesson()
                                     .get_learning_plan().metodist,
                                     listener=instance.homework.teacher,
                                     homeworks=hws,
                                     text=teacher_msg_text)
            elif request.POST.get('action') == 'decline':
                user_log["title"] = "Действие преподавателя НЕ согласовано"
                user_log["color"] = "warning"
                send_homework_tg(request.user, instance.homework.teacher,
                                 hws, "Действие по ДЗ не согласовано")
            if request.POST.get('message'):
                agreement['message'] = request.POST.get('message')
                message = Message.objects.create(
                    sender=request.user,
                    sender_type=0,
                    receiver=instance.homework.teacher,
                    receiver_type=0,
                    message=request.POST.get('message')
                )
                tg_sync_chat_funcs.notify_message(message.id)
            for log in to_agreement:
                log.agreement = agreement
                log.save()

            for l_ in to_agreement:
                if l_.status == 7:
                    user_log['content']['list'].append({
                        "name": "Тип события",
                        "val": "согласование ДЗ"
                    })
                elif l_.status == 4:
                    user_log['content']['list'].append({
                        "name": "Тип события",
                        "val": "принятие ДЗ"
                    })
                elif l_.status == 5:
                    user_log['content']['list'].append({
                        "name": "Тип события",
                        "val": "отправка ДЗ на доработку"
                    })
            for hw in hws:
                user_log['content']['list'].append({
                    "name": "Ученик",
                    "val": f"{hw.listener.first_name} {hw.listener.last_name}"
                })
                user_log['buttons'].append(
                    {"inner": f"{hw.name} ({hw.listener})",
                     "href": f"/homeworks/{hw.id}"}
                )
            user_log['buttons'].append({"inner": "Занятие",
                                        "href": f"/lessons/{lesson.id}"})
            if request.POST.get('message'):
                user_log['content']['list'].append({
                    "name": "Комментарий",
                    "val": request.POST.get('message')
                })
            UserLog.objects.create(**user_log)
            return Response(data={'status': True},
                            status=status.HTTP_200_OK)
        return Response(status=status.HTTP_404_NOT_FOUND)

    def patch(self, request: Request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.comment = request.POST.get('comment')
            instance.files.add(*self.get_files())
            instance.save()
            return Response(data={"status": "ok"},
                            status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={"error": str(e)},
                            status=status.HTTP_400_BAD_REQUEST)


class HomeworkReplaceTeacherAPIView(CanReplaceTeacherMixin, APIView):
    def patch(self, request, *args, **kwargs):
        try:
            hw = Homework.objects.get(pk=kwargs.get("pk"))
            hw.teacher_id = request.data.get('teacher_id')
            hw.save()
            return Response(data={'status': 'ok'},
                            status=status.HTTP_200_OK)
        except Homework.DoesNotExist:
            return Response(data={'error': 'ДЗ не найдено'},
                            status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(data={'error': str(e)},
                            status=status.HTTP_400_BAD_REQUEST)


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
            return Response({'status': 'Ошибка! ДЗ не найдено'},
                            status=status.HTTP_404_NOT_FOUND)
        if hw.get_status().status in [4, 6]:
            return Response({'status': 'Невозможно отменить ДЗ, так как '
                                       'оно либо принято, либо уже отменено'},
                            status=status.HTTP_400_BAD_REQUEST)
        hl = HomeworkLog.objects.create(
            homework=hw,
            user=request.user,
            comment="Домашнее задание отменено",
            status=6
        )
        serializer = HomeworkLogSerializer(hl, many=False,
                                           context={'request': request})
        return Response(data={'status': 'ok',
                              'log': serializer.data},
                        status=status.HTTP_200_OK)


class HomeworkItemDeleteMaterialAPIView(LoginRequiredMixin, APIView):
    def delete(self, request, *args, **kwargs):
        try:
            hw = Homework.objects.get(pk=kwargs.get('hw_id'))
        except Homework.DoesNotExist:
            return Response(data={"error": "ДЗ не найдено"},
                            status=status.HTTP_404_NOT_FOUND)
        perm = get_can_edit_hw_permission(hw, request)
        if not perm:
            return Response(data={
                "error": "Нет прав для редактирования ДЗ"
            },
                status=status.HTTP_403_FORBIDDEN)
        try:
            hw.materials.set(hw.materials.exclude(pk=kwargs.get('mat_id')))
            lesson = hw.get_lesson()
            plan = lesson.get_learning_plan() if lesson else None
            if plan:
                mat = Material.objects.get(pk=kwargs.get('mat_id'))
                ul = UserLog.objects.create(
                    log_type=4,
                    learning_plan=plan,
                    title="Из домашнего задания удалён материал",
                    content={
                        "list": [{
                            "name": "Наименование занятия",
                            "val": lesson.name
                        },
                            {
                                "name": "Дата занятия",
                                "val": lesson.date.strftime("%d.%m.%Y")
                            }
                        ],
                        "text": []
                    },
                    buttons=[{"inner": "ДЗ",
                              "href": f"/homeworks/{hw.id}"},
                             {"inner": "Занятие",
                              "href": f"/lessons/{lesson.id}"}],
                    user=request.user,
                    color="danger"
                )
                ul.materials_db.add(mat.id)
                ul.save()

            return Response(data={'status': 'ok'},
                            status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={'error': str(e)},
                            status=status.HTTP_400_BAD_REQUEST)


class HomeworkItemAgreementAPIView(LoginRequiredMixin, APIView):
    def add_log(self,
                homeworks_: QuerySet(Homework),
                lesson_: Lesson,
                to_agreement_: QuerySet(HomeworkLog),
                **kwargs) -> None:
        user_log = {
            "log_type": 1,
            "learning_plan": lesson_.get_learning_plan(),
            "content": {"list": [],
                        "text": [
                            f'Методист обработал действие преподавателя '
                            f'по ДЗ к занятию '
                            f'"{lesson_.name}" от '
                            f'{lesson_.date.strftime("%d.%m.%Y")}',
                            f'Проверяющий ДЗ: {homeworks_[0].teacher.first_name} '
                            f'{homeworks_[0].teacher.last_name}'
                        ]},
            "user": self.request.user,
            "buttons": []}
        if kwargs.get('action') == 'accept':
            user_log["title"] = "Действие преподавателя согласовано"
            user_log["color"] = "info"
        elif kwargs.get('action') == 'decline':
            user_log["title"] = "Действие преподавателя НЕ согласовано"
            user_log["color"] = "warning"
        for l_ in to_agreement_:
            if l_.status == 7:
                user_log['content']['list'].append({
                    "name": "Тип события",
                    "val": "согласование ДЗ"
                })
            elif l_.status == 4:
                user_log['content']['list'].append({
                    "name": "Тип события",
                    "val": "принятие ДЗ"
                })
            elif l_.status == 5:
                user_log['content']['list'].append({
                    "name": "Тип события",
                    "val": "отправка ДЗ на доработку"
                })
        for hw in homeworks_:
            user_log['content']['list'].append({
                "name": "Ученик",
                "val": f"{hw.listener.first_name} {hw.listener.last_name}"
            })
            user_log['buttons'].append(
                {"inner": f"{hw.name} ({hw.listener})",
                 "href": f"/homeworks/{hw.id}"}
            )
        user_log['buttons'].append({"inner": "Занятие",
                                    "href": f"/lessons/{lesson_.id}"})
        if self.request.POST.get('comment'):
            user_log['content']['list'].append({
                "name": "Комментарий",
                "val": self.request.POST.get('comment')
            })
        UserLog.objects.create(**user_log)

    def notify(self, hw_log_: HomeworkLog):
        if self.kwargs['action'] == 'accept':
            if hw_log_.status == 7:
                send_homework_tg(
                    initiator=hw_log_.homework.teacher,
                    listener=hw_log_.homework.listener,
                    homeworks=[hw_log_.homework]
                )
                send_homework_tg(
                    initiator=hw_log_.homework.get_lesson()
                    .get_learning_plan().metodist,
                    listener=hw_log_.homework.teacher,
                    homeworks=[hw_log_.homework],
                    text="ДЗ было согласовано и задано"
                )
            else:
                if hw_log_.status == 4:
                    teacher_msg_text = ("Ответ на решение согласован. "
                                        "ДЗ принято")
                    send_homework_answer_tg(hw_log_.homework.listener,
                                            hw_log_.homework, 4)
                elif hw_log_.status == 5:
                    teacher_msg_text = ("Ответ на решение согласован. "
                                        "ДЗ отправлено на доработку")
                    send_homework_answer_tg(hw_log_.homework.listener,
                                            hw_log_.homework, 5)
                else:
                    teacher_msg_text = "Домашнее задание согласовано"
                send_homework_tg(initiator=hw_log_.homework.get_lesson()
                                 .get_learning_plan().metodist,
                                 listener=hw_log_.homework.teacher,
                                 homeworks=[hw_log_.homework],
                                 text=teacher_msg_text)
        elif self.kwargs['action'] == 'decline':
            send_homework_tg(initiator=self.request.user,
                             listener=hw_log_.homework.teacher,
                             homeworks=[hw_log_.homework],
                             text="Действие по ДЗ не согласовано")

    def post(self, request, *args, **kwargs):
        try:
            homework = Homework.objects.get(pk=kwargs['pk'])
        except Homework.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if not get_can_accept_log_permission(homework, request):
            return Response(status=status.HTTP_403_FORBIDDEN)
        last_status = homework.get_status().status
        if last_status == 7:
            hw_group = homework.homeworkgroups_set.first()
            hws = hw_group.homeworks.all() if hw_group \
                else [homework]
        else:
            hws = [homework]
        to_agreement = HomeworkLog.objects.filter(
                homework__id__in=[hw.id for hw in hws],
                agreement__accepted=False
            )
        accepted_dt = datetime.datetime.now()
        lesson = homework.get_lesson()
        agreement = {
            "accepted_dt": {
                "year": accepted_dt.year,
                "month": accepted_dt.month,
                "day": accepted_dt.day,
                "hour": accepted_dt.hour,
                "minute": accepted_dt.minute
            },
            "accepted": True if kwargs['action'] == "accept" else False,
            "message": request.POST.get('comment')
        }
        for hw_log in to_agreement:
            hw_log.agreement = agreement
            hw_log.save()
            self.notify(hw_log)
        if self.request.POST.get('comment'):
            message = Message.objects.create(
                sender=request.user,
                sender_type=0,
                receiver=homework.teacher,
                receiver_type=0,
                message=request.POST.get('comment')
            )
            tg_sync_chat_funcs.notify_message(message.id)
        return Response(data={'status': True},
                        status=status.HTTP_200_OK)
