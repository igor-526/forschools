from datetime import datetime, timedelta

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.api_v2.serializers import LessonDashboardSerializer
from lesson.models import Lesson


class DashboardAPIView(APIView):
    def get_queryset(self, mode: str):
        dates = self.get_week()
        if mode == 'lessons':
            return Lesson.objects.select_related("replace_teacher").filter(
                date__gte=dates[0],
                date__lte=dates[1],
                start_time__isnull=False,
                end_time__isnull=False,
                date__isnull=False
            )
        return None

    @staticmethod
    def get_week(offset=0) -> tuple[datetime, datetime]:
        today = datetime.now()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        start_of_week += timedelta(weeks=offset)
        end_of_week = start_of_week + timedelta(days=6, hours=23, minutes=59, seconds=59, microseconds=999999)

        return start_of_week, end_of_week

    def get(self, request, *args, **kwargs):
        return Response(data=LessonDashboardSerializer(self.get_queryset('lessons'), many=True).data*5,
                        status=status.HTTP_200_OK)