import datetime
from rest_framework import status
from rest_framework.views import APIView
from homework.models import Homework
from learning_plan.models import LearningPlan, LearningPhases
from lesson.models import Lesson
from rest_framework.response import Response


class AutomaticFieldAPIView(APIView):
    def get_learning_plan_name(self):
        qp = self.request.query_params
        if qp.get('teacher'):
            count = LearningPlan.objects.filter(
                teacher=qp.get('teacher')
            ).count()
            return Response(data={'name': f'Учебный план {count + 1}'},
                            status=status.HTTP_200_OK)
        else:
            count = LearningPlan.objects.count()
            return Response(data={'name': f'Учебный план {count + 1}'},
                            status=status.HTTP_200_OK)

    def get_learning_phase_name(self):
        qp = self.request.query_params
        if qp.get('learning_plan'):
            try:
                count = LearningPlan.objects.get(
                    pk=qp.get('learning_plan')
                ).phases.count()
                return Response(data={'name': f'Этап {count + 1}'},
                                status=status.HTTP_200_OK)
            except LearningPlan.DoesNotExist:
                return Response(data={'learning_plan': 'not found'},
                                status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(data={'learning_plan': 'not found'},
                            status=status.HTTP_400_BAD_REQUEST)

    def get_lesson_name(self):
        qp = self.request.query_params
        if qp.get('learning_phase'):
            try:
                count = LearningPhases.objects.get(
                    pk=qp.get('learning_phase')
                ).lessons.count()
                return Response(data={'name': f'Занятие {count + 1}'},
                                status=status.HTTP_200_OK)
            except LearningPhases.DoesNotExist:
                return Response(data={'learning_phase': 'not found'},
                                status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(data={'learning_phase': 'not found'},
                            status=status.HTTP_400_BAD_REQUEST)

    def get_hw_name(self):
        qp = self.request.query_params
        if qp.get('lesson'):
            try:
                lesson = Lesson.objects.get(pk=qp.get('lesson'))
                count = lesson.homeworks.count()
                return Response(data={'name': f'ДЗ к занятию "{lesson.name}" '
                                              f'{count + 1}'},
                                status=status.HTTP_200_OK)
            except Lesson.DoesNotExist:
                return Response(data={'lesson': 'not found'},
                                status=status.HTTP_404_NOT_FOUND)
        else:
            count = Homework.objects.count()
            return Response(data={'name': f'Домашнее задание {count + 1}',
                                  'deadline': (datetime.date.today() +
                                               datetime.timedelta(days=7))},
                            status=status.HTTP_200_OK)

    def get(self, request, *args, **kwargs):
        field = kwargs.get('field')
        if field == "learning_plan":
            return self.get_learning_plan_name()
        if field == "learning_phase":
            return self.get_learning_phase_name()
        if field == "lesson":
            return self.get_lesson_name()
        if field == "homework":
            return self.get_hw_name()
        return Response(data={'data': 'uncorrected data'},
                        status=status.HTTP_400_BAD_REQUEST)
