from _operator import itemgetter
from datetime import datetime
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from homework.models import HomeworkLog
from profile_management.models import NewUser
from tgbot.models import TgBotJournal
from chat.models import Message
from learning_plan.models import LearningPlan
from .serializers import UserLogsHWLogsSerializer, UserLogsTGBotJournalSerializer, UserLogsMessageSerializer


class UserLogsActionsAPIView(LoginRequiredMixin, APIView):
    all_users_id = None

    def set_all_users_ids(self, plan_id: int):
        lp = LearningPlan.objects.get(id=plan_id)
        teacher_id = lp.teacher.id if lp.teacher else None
        hw_teacher_id = lp.default_hw_teacher.id if lp.default_hw_teacher else None
        methodist_id = lp.metodist.id if lp.metodist else None
        listeners_ids = [l.id for l in lp.listeners.all()]
        curators_ids = [l.id for l in lp.curators.all()]
        all_users = [teacher_id, hw_teacher_id, methodist_id, *listeners_ids, *curators_ids]
        while None in all_users:
            all_users.remove(None)
        self.all_users_id = all_users

    def get_hw_logs(self, plan_id: int):
        query = {}
        if plan_id:
            query['homework__lesson__learningphases__learningplan__id'] = plan_id
        date_from = self.request.query_params.get('date_from')
        if date_from:
            date_from = datetime.strptime(date_from.split("T")[0], '%Y-%m-%d')
            query['dt__date__gte'] = date_from
        date_to = self.request.query_params.get('date_to')
        if date_to:
            date_to = datetime.strptime(date_to.split("T")[0], '%Y-%m-%d')
            query['dt__date__lte'] = date_to
        logs_queryset = HomeworkLog.objects.filter(**query)
        return UserLogsHWLogsSerializer(logs_queryset, many=True).data

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
        return UserLogsTGBotJournalSerializer(notes, many=True).data

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
        return UserLogsMessageSerializer(messages, many=True).data

    def get(self, request, *args, **kwargs):
        self.set_all_users_ids(kwargs.get('plan_pk'))
        hw_logs = self.get_hw_logs(kwargs.get('plan_pk')) if request.query_params.get('homeworks') == 'true' else []
        tg_journal_notes = self.get_tg_journal_notes() if request.query_params.get('tg_journal') == 'true' else []
        messages = self.get_messages() if request.query_params.get('messages') == 'true' else []
        all_notes = [*hw_logs, *tg_journal_notes, *messages][:50]
        all_notes = sorted(all_notes, key=itemgetter("date"), reverse=True)
        return Response(all_notes, status=status.HTTP_200_OK)
