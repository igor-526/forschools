from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Count, Q
from rest_framework import status
from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response

from learning_plan.api_v2.serializers import LearningPlanSerializer
from learning_plan.models import LearningPlan


class PlansListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = LearningPlanSerializer

    @staticmethod
    def build_query_dict(query_params):
        query_dict = dict()

        search_name = query_params.get('name')
        filter_status = query_params.get('status')
        filter_teachers = query_params.getlist('teacher[]')
        filter_listeners = query_params.getlist('listener[]')
        filter_methodists = query_params.getlist('methodist[]')
        filter_has_methodist = query_params.get('has_methodist')
        filter_has_admin_comment = query_params.get('has_admin_comment')
        search_admin_comment = query_params.get('admin_comment')
        filter_admin_comment_date_start = query_params.get('admin_comment_date_start')
        filter_admin_comment_date_end = query_params.get('admin_comment_date_end')

        if search_name:
            query_dict['name__icontains'] = search_name

        if filter_teachers:
            query_dict['teacher__in'] = filter_teachers

        if filter_listeners:
            query_dict['listeners__in'] = filter_listeners

        if filter_methodists:
            query_dict['metodist__in'] = filter_methodists

        if filter_has_methodist == 'true':
            query_dict['metodist__isnull'] = False
        elif filter_has_methodist == 'false':
            query_dict['metodist__isnull'] = True

        if filter_has_admin_comment == 'true':
            query_dict['admin_comment__isnull'] = False
        elif filter_has_admin_comment == 'false':
            query_dict['admin_comment__isnull'] = True

        if search_admin_comment:
            query_dict['admin_comment__icontains'] = search_admin_comment

        if filter_admin_comment_date_start:
            query_dict['admin_comment_last_change__date__gte'] = filter_admin_comment_date_start
        if filter_admin_comment_date_end:
            query_dict['admin_comment_last_change__date__lte'] = filter_admin_comment_date_end

        if filter_status == "processing":
            query_dict['awaiting_lessons_count__gt'] = 0
        elif filter_status == "closed":
            query_dict['awaiting_lessons_count'] = 0

        return query_dict

    def get_queryset(self, *args, **kwargs):
        queryset = LearningPlan.objects.annotate(
            awaiting_lessons_count=Count(
                'phases__lessons',
                distinct=True,
                filter=Q(phases__lessons__status=0)
            )
        ).select_related(
            "teacher", "metodist", "default_hw_teacher"
        ).prefetch_related("listeners", "curators").filter(**self.build_query_dict(kwargs["qp"]))
        return queryset

    def list(self, request, *args, **kwargs):
        query_params = request.query_params

        queryset = self.get_queryset(qp=query_params)

        page = query_params.get("page")
        if page:
            try:
                page = int(page)
                if page < 1:
                    page = 1
            except ValueError:
                page = 1
        else:
            page = 1

        count = queryset.count()
        queryset = queryset[(page-1) * 50:page * 50]

        return Response(data={"count": count,
                              "items": self.serializer_class(queryset, many=True, context={"request": request}).data},
                        status=status.HTTP_200_OK)
