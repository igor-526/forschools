from django.db.models import Count, Prefetch, Q
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from learning_plan.models import LearningPlan, LearningPhases
from lesson.api_v2.serializers import LessonListSerializer, LessonPlaceSerializer, LessonPlaceNameOnlySerializer, \
    LessonDetailSerializer
from lesson.models import Lesson, Place
from profile_management.models import NewUser
from datetime import datetime, timedelta


class LessonListAPIView(ListAPIView):
    model = Lesson
    serializer_class = LessonListSerializer
    permission_classes = [IsAuthenticated]

    def filter_queryset(self, queryset):
        query_params = self.request.query_params

        query = {}

        search_name = query_params.get('name')
        filter_date_start = query_params.get('date_start')
        filter_date_end = query_params.get('date_end')
        filter_teachers = query_params.getlist('teacher[]')
        filter_listeners = query_params.getlist('listener[]')
        filter_methodists = query_params.getlist("methodist[]")
        filter_has_hw = query_params.get("has_hw")
        filter_place = query_params.getlist("place[]")
        filter_status = query_params.get('status')
        filter_has_admin_comment = query_params.get("has_admin_comment")
        search_admin_comment = query_params.get("admin_comment")

        if search_name:
            query['name__icontains'] = search_name

        if filter_date_start or filter_date_end:
            if filter_date_start:
                query['date__gte'] = filter_date_start
            if filter_date_end:
                query['date__lte'] = filter_date_end
        else:
            today = datetime.now()
            query['date__gte'] = today - timedelta(days=2)
            query['date__lte'] = today + timedelta(days=6)

        if filter_listeners:
            query['learningphases__learningplan__listeners__in'] = filter_listeners
        if filter_methodists:
            query['learningphases__learningplan__metodist__in'] = filter_methodists
        if filter_has_hw == 'true':
            query['hw_count__gte'] = 1
        elif filter_has_hw == 'false':
            query['hw_count'] = 0
        if filter_status:
            query['status'] = filter_status
        if filter_has_admin_comment == 'true':
            query['admin_comment__isnull'] = False
        elif filter_has_admin_comment == 'false':
            query['admin_comment__isnull'] = True
        if search_admin_comment:
            query['admin_comment__icontains'] = search_admin_comment
        if filter_place:
            query['place__id__in'] = filter_place
        if filter_teachers:
            queryset = queryset.filter(
                Q(learningphases__learningplan__teacher__in=filter_teachers,
                  **query) |
                Q(replace_teacher__id__in=filter_teachers,
                  **query)
            )
        else:
            queryset = queryset.filter(**query)
        return queryset

    def get_queryset(self, *args, **kwargs):
        queryset = Lesson.objects.annotate(
            hw_count=Count("homeworks")
        ).prefetch_related(
            Prefetch("learningphases_set",
                     queryset=LearningPhases.objects.only('id', 'name')),
            Prefetch("learningphases_set__learningplan_set",
                     queryset=LearningPlan.objects.only('id', 'name')),
            Prefetch("learningphases_set__learningplan_set__listeners",
                     queryset=NewUser.objects.only('id', 'first_name', 'last_name')),
            "additional_listeners"
        ).select_related(
            "replace_teacher", "place"
        ).only(
            "id", "name", "date", "start_time", "end_time",
            "replace_teacher_id", "place_id", "admin_comment"
        )
        queryset = self.filter_queryset(queryset)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        page = request.query_params.get("page")
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

class LessonPlacesListAPIView(ListAPIView):
    model = Place
    serializer_class = LessonPlaceSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.query_params.get("name_only", None) == "true":
            return LessonPlaceNameOnlySerializer
        return LessonPlaceSerializer

    def filter_queryset(self, queryset):
        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(url__icontains=search) |
                Q(conf_id__icontains=search) |
                Q(access_code__icontains=search)
            )

        return queryset.distinct()

    def get_queryset(self, *args, **kwargs):
        roles = self.request.user.roles
        if "Admin" in roles:
            queryset = Place.objects.all()
        else:
            if "Metodist" in roles:
                queryset = Place.objects.filter(lesson__learningphases__learningplan__metodist=self.request.user.id)
            if "Teacher" in roles:
                queryset = Place.objects.filter(lesson__learningphases__learningplan__teacher=self.request.user.id)
            if "Curator" in roles:
                queryset = Place.objects.filter(lesson__learningphases__learningplan__curators=self.request.user.id)
            if "Listener" in roles:
                queryset = Place.objects.filter(lesson__learningphases__learningplan__listeners=self.request.user.id)
        return self.filter_queryset(queryset)


class LessonDetailRetrieveUpdateAPIView(RetrieveUpdateAPIView):
    model = Lesson
    serializer_class = LessonDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self, *args, **kwargs):
        queryset = Lesson.objects.annotate(
            hw_count=Count("homeworks")
        ).prefetch_related(
            Prefetch("learningphases_set",
                     queryset=LearningPhases.objects.only('id', 'name')),
            Prefetch("learningphases_set__learningplan_set",
                     queryset=LearningPlan.objects.only('id', 'name')),
            Prefetch("learningphases_set__learningplan_set__listeners",
                     queryset=NewUser.objects.only('id', 'first_name', 'last_name')),
            "additional_listeners"
        ).select_related(
            "replace_teacher", "place"
        ).only(
            "id", "name", "date", "start_time", "end_time",
            "replace_teacher_id", "place_id", "admin_comment"
        )
        queryset = self.filter_queryset(queryset)
        return queryset
