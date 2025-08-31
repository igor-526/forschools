from django.db.models import Prefetch, OuterRef, Subquery, Q, DateTimeField
from rest_framework.generics import ListAPIView

from homework.api_v2.serializers import HomeworkListSerializer
from homework.models import Homework, HomeworkLog
from lesson.models import Lesson


class HomeworkListAPIView(ListAPIView):
    model = Homework
    serializer_class = HomeworkListSerializer

    def filter_queryset(self, queryset, *args, **kwargs):
        query_params = self.request.query_params
        user_roles = kwargs['user_roles'] if kwargs.get('user_roles') else []
        query=dict()

        search_name = query_params.get('name')
        filter_teachers = query_params.getlist('teacher[]')
        filter_listeners = query_params.getlist('listener[]')
        filter_methodists = query_params.getlist("methodist[]")
        filter_assigned_date_start = query_params.get('assigned_date_start')
        filter_assigned_date_end = query_params.get('assigned_date_end')
        filter_last_status = query_params.getlist('last_status[]')
        filter_last_status_date_start = query_params.get('last_status_date_start')
        filter_last_status_date_end = query_params.get('last_status_date_end')
        filter_lessons = query_params.getlist('lesson[]')


        if search_name:
            query['name__icontains'] = search_name

        if filter_teachers:
            query["teacher__in"] = filter_teachers

        if filter_listeners:
            query["listener__in"] = filter_listeners

        if filter_methodists:
            query['lesson_set_learningphases__learningplan__metodist__in'] = filter_methodists

        if filter_assigned_date_start:
            query["assigned_log_dt__date__gte"] = filter_assigned_date_start

        if filter_assigned_date_end:
            query["assigned_log_dt__date__lte"] = filter_assigned_date_end

        if filter_last_status:
            query["last_log_status__in"] = filter_last_status

        if filter_last_status_date_start:
            query["last_log_dt__date__gte"] = filter_last_status_date_start

        if filter_last_status_date_end:
            query["last_log_dt__date__lte"] = filter_last_status_date_end

        if filter_lessons:
            query["lesson__in"] = filter_lessons


        if "Admin" in user_roles:
            filter_has_admin_comment = query_params.get('has_admin_comment')
            search_admin_comment = query_params.get('admin_comment')

            if filter_has_admin_comment == "false":
                query["admin_comment__isnull"] = True
            elif filter_has_admin_comment == "true":
                query["admin_comment__isnull"] = False
            elif search_admin_comment:
                query["admin_comment__icontains"] = search_admin_comment

        return queryset.filter(**query)

    def get_queryset(self, *args, **kwargs):
        user_roles = self.request.user.roles

        if "Admin" in user_roles or "Metodist" in user_roles or "Teacher" in user_roles:
            last_log_queryset = HomeworkLog.objects.all().order_by('-dt')[:1]
            assigned_log_queryset = HomeworkLog.objects.filter(Q(agreement = {}) | Q(agreement__accepted=True)).order_by('-dt')[:1]
        else:
            last_log_queryset = HomeworkLog.objects.filter(status=7).order_by('-dt')[:1]
            assigned_log_queryset = HomeworkLog.objects.filter(Q(agreement={}, status=7) | Q(agreement__accepted=True, status=7))[:1]

        last_log_dt = HomeworkLog.objects.filter(
            homework=OuterRef('pk')
        ).order_by('-dt').values('dt')[:1]

        last_log_status = HomeworkLog.objects.filter(
            homework=OuterRef('pk')
        ).order_by('-dt').values('status')[:1]

        assigned_log_dt = HomeworkLog.objects.filter(
            homework=OuterRef('pk'),
            status=7
        ).order_by('-dt').values('dt')[:1]

        queryset = Homework.objects.select_related(
            "teacher", "listener"
        ).annotate(
            last_log_dt=Subquery(last_log_dt, output_field=DateTimeField()),
            last_log_status=Subquery(last_log_status),
            assigned_log_dt=Subquery(assigned_log_dt, output_field=DateTimeField()),
        ).prefetch_related("lesson_set")
        queryset = self.filter_queryset(queryset, user_roles=user_roles)
        return queryset