from _operator import itemgetter
from datetime import datetime
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from homework.models import HomeworkLog
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
        print(query_user_logs)
        print(user_logs_queryset)
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
