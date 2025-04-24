from _operator import itemgetter
from datetime import datetime
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
import re
from homework.models import HomeworkLog
from material.utils.get_type import get_type
from profile_management.models import NewUser
from profile_management.serializers import NewUserNameOnlyListSerializer
from user_logs.models import UserLog
from tgbot.models import TgBotJournal
from chat.models import Message
from learning_plan.models import LearningPlan
from lesson.models import LessonTeacherReview
from .serializers import UserLogsHWLogsSerializer, UserLogsTGBotJournalSerializer, UserLogsMessageSerializer, \
    UserLogsSerializer, UserLogsLessonReviewSerializer


class UserLogsActionsAPIView(LoginRequiredMixin, APIView):
    all_users_id = None
    plan_info = {}
    lp = None

    def set_plan_info_and_all_users_ids(self, plan_id: int):
        self.lp = LearningPlan.objects.get(id=plan_id)
        self.plan_info["name"] = self.lp.name
        self.plan_info["id"] = self.lp.id
        if self.lp.teacher:
            self.plan_info["teacher"] = NewUserNameOnlyListSerializer(self.lp.teacher, many=False).data
            teacher_id = self.lp.teacher.id
        else:
            teacher_id = None

        if self.lp.default_hw_teacher:
            self.plan_info["default_hw_teacher"] = NewUserNameOnlyListSerializer(self.lp.default_hw_teacher, many=False).data
            hw_teacher_id = self.lp.default_hw_teacher.id
        else:
            hw_teacher_id = None

        if self.lp.metodist:
            self.plan_info["methodist"] = NewUserNameOnlyListSerializer(self.lp.metodist, many=False).data
            methodist_id = self.lp.metodist.id
        else:
            methodist_id = None
        listeners = self.lp.listeners.all()
        if listeners:
            self.plan_info["listeners"] = NewUserNameOnlyListSerializer(listeners, many=True).data
        listeners = [l.id for l in listeners] if listeners else []
        curators = self.lp.curators.all()
        if curators:
            self.plan_info["curators"] = NewUserNameOnlyListSerializer(curators, many=True).data
        curators = [c.id for c in curators] if curators else []
        all_users = [teacher_id, hw_teacher_id, methodist_id, *listeners, *curators]
        while None in all_users:
            all_users.remove(None)
        self.all_users_id = all_users

    def get_hw_logs(self, plan_id: int):
        query_hw_logs = {}
        query_user_logs = {"log_type__in": [1, 4],
                           "learning_plan__id": plan_id}
        if plan_id:
            query_hw_logs['homework__lesson__learningphases__learningplan__id'] = plan_id
            query_user_logs['learning_plan__id'] = plan_id
        date_from = self.request.query_params.get('date_from')
        if date_from:
            date_from = datetime.strptime(date_from.split("T")[0], '%Y-%m-%d')
            query_hw_logs['dt__date__gte'] = date_from
            query_user_logs['date__date__gte'] = date_from
        date_to = self.request.query_params.get('date_to')
        if date_to:
            date_to = datetime.strptime(date_to.split("T")[0], '%Y-%m-%d')
            query_hw_logs['dt__date__lte'] = date_to
            query_user_logs['date__date__lte'] = date_to
        hw_logs_queryset = HomeworkLog.objects.filter(**query_hw_logs)
        user_logs_queryset = UserLog.objects.filter(**query_user_logs)
        hw_logs_ser = UserLogsHWLogsSerializer(hw_logs_queryset,
                                               many=True,
                                               context={"request": self.request,
                                                        "plan": self.lp}).data
        user_logs_ser = UserLogsSerializer(user_logs_queryset, many=True).data
        return [*hw_logs_ser, *user_logs_ser]

    def get_tg_journal_notes(self):
        query = {"recipient__id__in": self.all_users_id,
                 "initiator__id__in": self.all_users_id,}
        date_from = self.request.query_params.get('date_from')
        if date_from:
            date_from = datetime.strptime(date_from.split("T")[0], '%Y-%m-%d')
            query['dt__date__gte'] = date_from
        date_to = self.request.query_params.get('date_to')
        if date_to:
            date_to = datetime.strptime(date_to.split("T")[0], '%Y-%m-%d')
            query['dt__date__lte'] = date_to
        notes = TgBotJournal.objects.filter(**query)
        return UserLogsTGBotJournalSerializer(notes,
                                              many=True,
                                              context={"request": self.request,
                                                       "plan": self.lp}).data

    def get_messages(self):
        query = {"sender__id__in": self.all_users_id,
                 "receiver__id__in": self.all_users_id}
        date_from = self.request.query_params.get('date_from')
        if date_from:
            date_from = datetime.strptime(date_from.split("T")[0], '%Y-%m-%d')
            query['date__date__gte'] = date_from
        date_to = self.request.query_params.get('date_to')
        if date_to:
            date_to = datetime.strptime(date_to.split("T")[0], '%Y-%m-%d')
            query['date__date__lte'] = date_to
        messages = Message.objects.filter(**query)
        return UserLogsMessageSerializer(messages,
                                         many=True,
                                         context={"request": self.request,
                                                  "plan": self.lp}).data

    def get_lessons(self, plan_id: int):
        query_reviews = {"lesson__learningphases__learningplan__id": plan_id}
        query_user_logs = {"learning_plan__id": plan_id}
        if self.request.user.groups.filter(name="Admin").exists():
            query_user_logs["log_type__in"] = [2, 5]
        else:
            query_user_logs["log_type"] = 2
        date_from = self.request.query_params.get('date_from')
        if date_from:
            date_from = datetime.strptime(date_from.split("T")[0], '%Y-%m-%d')
            query_reviews['dt__date__gte'] = date_from
            query_user_logs['date__date__gte'] = date_from
        date_to = self.request.query_params.get('date_to')
        if date_to:
            date_to = datetime.strptime(date_to.split("T")[0], '%Y-%m-%d')
            query_reviews['dt__date__lte'] = date_to
            query_user_logs['date__date__lte'] = date_to
        reviews = LessonTeacherReview.objects.filter(**query_reviews)
        user_logs_queryset = UserLog.objects.filter(**query_user_logs)
        reviews_ser = UserLogsLessonReviewSerializer(reviews, many=True).data
        user_logs_ser = UserLogsSerializer(user_logs_queryset, many=True).data
        return [*reviews_ser, *user_logs_ser]

    def get_plans(self, plan_id: int):
        query_user_logs = {"log_type": 3,
                           "learning_plan__id": plan_id}
        date_from = self.request.query_params.get('date_from')
        if date_from:
            date_from = datetime.strptime(date_from.split("T")[0], '%Y-%m-%d')
            query_user_logs['date__date__gte'] = date_from
        date_to = self.request.query_params.get('date_to')
        if date_to:
            date_to = datetime.strptime(date_to.split("T")[0], '%Y-%m-%d')
            query_user_logs['date__date__lte'] = date_to
        user_logs_queryset = UserLog.objects.filter(**query_user_logs)
        return UserLogsSerializer(user_logs_queryset, many=True).data

    def get(self, request, *args, **kwargs):
        self.all_users_id = None
        self.plan_info = {}
        self.lp = None
        if kwargs.get('plan_pk'):
            self.set_plan_info_and_all_users_ids(kwargs.get('plan_pk'))
        hw_logs = self.get_hw_logs(kwargs.get('plan_pk')) if request.query_params.get('homeworks') == 'true' else []
        tg_journal_notes = self.get_tg_journal_notes() if request.query_params.get('tg_journal') == 'true' else []
        messages = self.get_messages() if request.query_params.get('messages') == 'true' else []
        lessons = self.get_lessons(kwargs.get('plan_pk')) if request.query_params.get('lessons') == 'true' else []
        plans = self.get_plans(kwargs.get('plan_pk')) if request.query_params.get('plans') == 'true' else []
        offset = int(request.query_params.get('offset')) if request.query_params.get('offset') else 0
        all_notes = [*hw_logs, *tg_journal_notes, *messages, *lessons, *plans][offset:offset + 50]
        all_notes = sorted(all_notes, key=itemgetter("date"), reverse=True)
        return Response({"plan_info": self.plan_info, "logs": all_notes}, status=status.HTTP_200_OK)


class UserLogsMessagesUsersAPIVIew(LoginRequiredMixin, APIView):
    def get_user_info(self, user: NewUser, role: str):
        return {
            "id": user.id,
            "usertype": "NewUser",
            "name": f"{user.first_name} {user.last_name}",
            "role": role,
            "last_message_dt": None
        }

    def get(self, request, *args, **kwargs):
        try:
            learning_plan = LearningPlan.objects.get(id=kwargs.get('plan_pk'))
        except LearningPlan.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        users = []
        selected_first_user = request.query_params.get('selected_first_user')
        if learning_plan.teacher:
            users.append(self.get_user_info(learning_plan.teacher, "Преподаватель"))
        if learning_plan.default_hw_teacher and learning_plan.default_hw_teacher != learning_plan.teacher:
            users.append(self.get_user_info(learning_plan.default_hw_teacher, "Проверяющий ДЗ"))
        if learning_plan.metodist:
            users.append(self.get_user_info(learning_plan.metodist, "Методист"))
        users.extend([self.get_user_info(user, "Куратор") for user in learning_plan.curators.all()])
        users.extend([self.get_user_info(user, "Ученик") for user in learning_plan.listeners.all()])
        if selected_first_user is not None:
            try:
                selected_first_user = int(selected_first_user)
            except ValueError:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            users = list(filter(lambda user: user.get("id") != selected_first_user, users))
        return Response(data=users, status=status.HTTP_200_OK)


class UserLogsMessagesChatAPIVIew(LoginRequiredMixin, APIView):
    selected_first_user: int
    selected_second_user: int
    msg_id: int

    def get_messages(self, query):
        return [{
            "tags": message.tags,
            "text": message.message if message.message else "Без текста",
            "date": message.date,
            "type": "receiver" if self.selected_first_user == message.sender.id else "sender",
            "read_data": message.read_data,
            "files": [{
                "type": get_type(f.path.name.split('.')[-1]),
                "href": f.path.url
            } for f in message.files.all()]
        } for message in query]

    def get_users_info(self):
        try:
            user_first = NewUser.objects.get(id=self.selected_first_user)
            user_second = NewUser.objects.get(id=self.selected_second_user)
        except NewUser.DoesNotExist:
            return {}
        return {
            "user_first": f'{user_first.first_name} {user_first.last_name}',
            "user_second": f'{user_second.first_name} {user_second.last_name}',
        }

    def get_queryset(self):
        filters = {}
        if self.msg_id:
            filters["id__gte"] = self.msg_id
        messages = Message.objects.filter(Q(sender=self.selected_first_user,
                                            receiver=self.selected_second_user,
                                            **filters) |
                                          Q(sender=self.selected_second_user,
                                            receiver=self.selected_first_user,
                                            **filters)).order_by("-date")
        return messages

    def get(self, request, *args, **kwargs):
        selected_first_user = request.query_params.get('selected_first_user')
        selected_second_user = request.query_params.get('selected_second_user')
        self.msg_id = request.query_params.get('msg_id')
        if selected_first_user and selected_second_user:
            try:
                self.selected_first_user = int(selected_first_user)
                self.selected_second_user = int(selected_second_user)
            except ValueError:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        return Response(data={"messages": self.get_messages(self.get_queryset()),
                              **self.get_users_info()}, status=status.HTTP_200_OK)


class UserLogsMessagesByTagAPIVIew(LoginRequiredMixin, APIView):
    plan_id: int
    tag: str

    def get_message_participants_info(self, message: Message):
        info = {}
        if message.sender:
            info["sender_id"] = message.sender.id
            info["sender_name"] = (f'{message.sender.first_name} '
                                   f'{message.sender.last_name}')
            info["sender_type"] = "NewUser"
        else:
            info["sender_id"] = message.sender_tg.id
            info["sender_name"] = (f'{message.sender_tg.user.first_name} '
                                   f'{message.sender_tg.user.last_name} '
                                   f'({message.sender_tg.usertype})')
            info["sender_type"] = "Telegram"
        if message.receiver:
            info["receiver_id"] = message.receiver.id
            info["receiver_name"] = (f'{message.receiver.first_name} '
                                     f'{message.receiver.last_name}')
            info["receiver_type"] = "NewUser"
        else:
            info["receiver_id"] = message.receiver_tg.id
            info["receiver_name"] = (f'{message.receiver_tg.user.first_name} '
                                     f'{message.receiver_tg.user.last_name} '
                                     f'({message.receiver_tg.usertype})')
            info["receiver_type"] = "Telegram"
        return info

    def get_messages_info(self, query):
        return [{
            "id": message.id,
            "text": message.message if message.message else "Без текста",
            "date": message.date,
            "files": message.files.exists(),
            **self.get_message_participants_info(message)
        } for message in query]

    def get(self, request, *args, **kwargs):
        try:
            self.plan_id = int(kwargs.get("plan_pk"))
        except ValueError:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        self.tag = request.query_params.get('tag')
        if not self.tag:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        query = Message.objects.filter(tags__contains=self.tag).order_by("date")
        return Response(data=self.get_messages_info(query), status=status.HTTP_200_OK)

