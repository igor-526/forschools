from datetime import datetime

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.http import Http404

from download_data.models import GenerateFilesTasks

from homework.models import Homework, HomeworkLog

from learning_program.models import LearningProgram

from lesson.models import Lesson

from rest_framework import status
from rest_framework.generics import (ListCreateAPIView,
                                     RetrieveUpdateDestroyAPIView)
from rest_framework.response import Response
from rest_framework.views import APIView

from user_logs.models import UserLog

from .models import LearningPhases, LearningPlan
from .permissions import (CanDownloadPlan,
                          CanEditPlanItemAdminComment,
                          can_edit_plan,
                          can_generate_from_program,
                          get_can_edit_pre_hw_comment)
from .serializers import (LearningPhasesListSerializer,
                          LearningPlanListSerializer,
                          LearningPlanParticipantsOnlyListSerializer)
from .tasks import plans_download
from .utils import (AddLessons,
                    ProgramSetter,
                    get_schedule,
                    plan_calculated_info)


class PlansItemStatusAPIView(LoginRequiredMixin, APIView):
    def get(self, request, *args, **kwargs):
        plan = LearningPlan.objects.get(pk=kwargs.get('pk'))
        phases_passed = 0
        lessons_all = Lesson.objects.filter(
            learningphases__learningplan=plan
        ).count()
        lessons_passed = Lesson.objects.filter(
            learningphases__learningplan=plan,
            status__in=[1, 2]
        ).count()
        return Response({
            "phases_passed": phases_passed,
            "lessons_all": lessons_all,
            "lessons_passed": lessons_passed,
            "can_close": lessons_all != lessons_passed and (
                request.user.groups.filter(
                    name__in=["Metodist", "Admin"]
                ).exists())
        })

    def post(self, request, *args, **kwargs):
        plan = LearningPlan.objects.get(pk=kwargs.get('pk'))
        lessons = Lesson.objects.filter(learningphases__learningplan=plan,
                                        status=0).all()
        homeworks = Homework.objects.filter(
            lesson__in=[lesson.id for lesson in lessons]
        )
        hwlogs = HomeworkLog.objects.filter(
            homework__in=[h.id for h in homeworks]
        )
        for hwlog in hwlogs:
            hwlog.delete()
        for homework in homeworks:
            homework.delete()
        for lesson in lessons:
            lesson.delete()
        all_phases = plan.phases.all()
        for phase in all_phases:
            if phase.lessons.count() == 0:
                phase.delete()
        return Response(data={"status": "success"},
                        status=status.HTTP_200_OK)


class PlansListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
    def get_serializer_class(self):
        if self.request.query_params.get('part_only') == "true":
            return LearningPlanParticipantsOnlyListSerializer
        return LearningPlanListSerializer

    def filter_all(self, queryset):
        query = dict()
        q_all = self.request.query_params.get('q_all')
        if q_all:
            splitted_query = q_all.split(' ')
            q = Q()
            for query in splitted_query:
                q |= Q(teacher__first_name__icontains=query)
                q |= Q(teacher__last_name__icontains=query)
                q |= Q(teacher__patronymic__icontains=query)
                q |= Q(listeners__first_name__icontains=query)
                q |= Q(listeners__last_name__icontains=query)
                q |= Q(listeners__patronymic__icontains=query)
                q |= Q(metodist__first_name__icontains=query)
                q |= Q(metodist__last_name__icontains=query)
                q |= Q(metodist__patronymic__icontains=query)
                q |= Q(default_hw_teacher__first_name__icontains=query)
                q |= Q(default_hw_teacher__last_name__icontains=query)
                q |= Q(default_hw_teacher__patronymic__icontains=query)
                q |= Q(curators__first_name__icontains=query)
                q |= Q(curators__last_name__icontains=query)
                q |= Q(curators__patronymic__icontains=query)
                q |= Q(name__icontains=query)
                return queryset.filter(q)
        q_name = self.request.query_params.get('name')
        q_teacher = self.request.query_params.getlist('teacher')
        q_listeners = self.request.query_params.getlist('listener')
        q_status = self.request.query_params.get('status')
        if q_name:
            query["name__icontains"] = q_name
        if q_teacher:
            query["teacher__id__in"] = q_teacher
        if q_listeners:
            query["listeners__id__in"] = q_listeners
        queryset = queryset.filter(**query)
        if q_status and queryset:
            filtered_plans = []
            if q_status == "processing":
                filtered_plans.extend(list(filter(
                    lambda plan: not plan.get_is_closed(), queryset
                )))
            if q_status == "closed":
                filtered_plans.extend(list(filter(
                    lambda plan: plan.get_is_closed(), queryset
                )))
            if filtered_plans:
                queryset = queryset.filter(
                    id__in=[plan.id for plan in filtered_plans]
                )
        return queryset

    def order_by_name(self, queryset):
        order_name = self.request.query_params.get('sort_name')
        order_query = []
        if order_name == "asc":
            order_query.append("name")
        elif order_name == "desc":
            order_query.append("-name")
        offset = int(self.request.query_params.get("offset")) if (
            self.request.query_params.get("offset")) else 0
        return queryset.order_by(*order_query).distinct()[offset:offset + 50] \
            if queryset else None

    def get_queryset(self):
        queryset = None
        if self.request.user.groups.filter(
                name__in=["Admin", "Metodist"]
        ).exists():
            queryset = LearningPlan.objects.all()
        elif self.request.user.groups.filter(name="Teacher").exists():
            queryset = LearningPlan.objects.filter(teacher=self.request.user)
        queryset = self.filter_all(queryset)
        queryset = self.order_by_name(queryset)
        return queryset


class PlansItemAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = LearningPlanListSerializer

    def get_queryset(self):
        usergroups = [group.name for group in self.request.user.groups.all()]
        queryset = LearningPlan.objects.all()
        if ("Admin" in usergroups) or ("Metodist" in usergroups):
            return queryset
        if "Teacher" in usergroups:
            return queryset.filter(teacher=self.request.user)
        if "Listener" in usergroups:
            return None


class PlanPhasesListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = LearningPhasesListSerializer

    def get_queryset(self, *args, **kwargs):
        queryset = LearningPlan.objects.get(
            pk=kwargs.get("plan_pk")
        ).phases.all()
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset(plan_pk=self.kwargs.get("plan_pk"))
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        try:
            plan = LearningPlan.objects.get(pk=kwargs.get("plan_pk"))
        except LearningPlan.DoesNotExist:
            raise Http404
        if can_edit_plan(request, plan=plan):
            serializer = self.get_serializer(data=request.data,
                                             context={"plan": plan})
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(data=serializer.data,
                                status=status.HTTP_201_CREATED)
            else:
                return Response(data=serializer.data,
                                status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)


class PlanPhaseItemAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = LearningPhasesListSerializer

    def get_object(self, *args, **kwargs):
        obj = LearningPhases.objects.get(pk=kwargs.get("phase_pk"))
        return obj

    def patch(self, request, *args, **kwargs):
        try:
            phase = self.get_object(phase_pk=kwargs.get("pk"))
        except LearningPhases.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if can_edit_plan(request, phase=phase):
            serializer = self.get_serializer(
                data=request.data,
                instance=phase,
                context={"plan": phase.learningplan_set.first()}
            )
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(data=serializer.data,
                                status=status.HTTP_201_CREATED)
            else:
                return Response(data=serializer.data,
                                status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

    def delete(self, request, *args, **kwargs):
        try:
            phase = self.get_object(phase_pk=kwargs.get("pk"))
        except LearningPhases.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if can_edit_plan(request, phase=phase):
            if phase.lessons.count() == 0:
                phase.delete()
                return Response(data={"status": "ok"},
                                status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_403_FORBIDDEN)


class PlansItemSetProgramAPIView(LoginRequiredMixin, APIView):
    def get(self, request, *args, **kwargs):
        program = LearningProgram.objects.get(
            pk=request.query_params.get("programID")
        )
        return Response(plan_calculated_info(
            datetime.strptime(request.query_params.get("date_start"),
                              "%Y-%m-%d"),
            get_schedule(request.query_params),
            program
        ), status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        program = LearningProgram.objects.get(
            pk=request.POST.get("programID")
        )
        plan = LearningPlan.objects.get(pk=kwargs.get("plan_pk"))
        if can_generate_from_program(request, plan):
            setter = ProgramSetter(
                datetime.strptime(request.POST.get("date_start"),
                                  "%Y-%m-%d"),
                get_schedule(request.POST),
                program,
                plan
            )
            setter.set_program()
            return Response(data={"status": "ok"},
                            status=status.HTTP_201_CREATED)
        else:
            return Response(data={
                "error": "Вы не можете сгенерировать план на основе программы"
            }, status=400)


class PlanItemAddLessonsAPIView(LoginRequiredMixin, APIView):
    def post(self, request, *args, **kwargs):
        plan = LearningPlan.objects.get(pk=kwargs.get("plan_pk"))
        generator_query = {
            "first_date": datetime.strptime(request.POST.get("date_start"),
                                            "%Y-%m-%d"),
            "schedule": get_schedule(request.POST),
            "plan": plan,
        }
        end_type = request.POST.get("end_type")
        if end_type == 'date':
            generator_query['last_lesson_date'] = datetime.strptime(
                request.POST.get("end_date"), "%Y-%m-%d"
            )
        elif end_type == 'count':
            generator_query['lessons_count'] = int(
                request.POST.get("end_count")
            )
        lessons_generator = AddLessons(**generator_query)
        lessons_generator.add_lessons()
        UserLog.objects.create(log_type=3,
                               learning_plan=plan,
                               title="В учебный план добавлены занятия",
                               content={
                                   "list": [],
                                   "text": []
                               },
                               buttons=[],
                               user=request.user)
        return Response(data={"status": "ok"}, status=status.HTTP_201_CREATED)


class PlansItemPreHWCommentAPIView(LoginRequiredMixin, APIView):
    def post(self, request, *args, **kwargs):
        try:
            plan = LearningPlan.objects.get(pk=kwargs.get("pk"))
        except LearningPlan.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if not get_can_edit_pre_hw_comment(request, plan):
            return Response(status=status.HTTP_403_FORBIDDEN)
        plan.pre_hw_comment = request.POST.get("pre_hw_comment")
        plan.save()
        return Response({"status": "ok"}, status=status.HTTP_201_CREATED)

    def delete(self, request, *args, **kwargs):
        try:
            plan = LearningPlan.objects.get(pk=kwargs.get("pk"))
        except LearningPlan.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if not get_can_edit_pre_hw_comment(request, plan):
            return Response(status=status.HTTP_403_FORBIDDEN)
        plan.pre_hw_comment = None
        plan.save()
        return Response({"status": "ok"}, status=status.HTTP_201_CREATED)


class PlansDownloadAPIView(CanDownloadPlan, APIView):
    def post(self, request, *args, **kwargs):
        note = GenerateFilesTasks.objects.create(
            type=1,
            initiator=request.user,
        )
        plans_download(request.data, note.id)
        return Response({"status": "ok"}, status=status.HTTP_200_OK)


class PlanItemAdminCommentAPIView(CanEditPlanItemAdminComment, APIView):
    def get_object(self, plan_id) -> LearningPlan | None:
        try:
            return LearningPlan.objects.get(pk=plan_id)
        except LearningPlan.DoesNotExist:
            return None

    def post(self, request, *args, **kwargs):
        plan = self.get_object(self.kwargs.get('pk'))
        if plan is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        comment = request.POST.get('comment')
        if not comment:
            UserLog.objects.create(
                log_type=5,
                learning_plan=plan,
                title="Администратор удалил комментарий по плану обучения",
                content={
                    "list": [],
                    "text": [plan.admin_comment]
                },
                buttons=[{"inner": f'План: {plan.name}',
                          "href": f"/learning_plans/{plan.id}/"}],
                color="danger",
                user=request.user
            )
            plan.admin_comment = None
            plan.save()
            return Response(
                data=LearningPlanListSerializer(
                    instance=plan,
                    many=False,
                    context={'request': request}
                ).data,
                status=status.HTTP_200_OK
            )
        comment = comment.strip()
        if len(comment) > 2000:
            return Response(
                data={'comment': 'Длина комментария не может превышать '
                                 '2000 символов'},
                status=status.HTTP_400_BAD_REQUEST
            )
        plan.admin_comment = comment
        plan.save()
        UserLog.objects.create(
            log_type=5,
            learning_plan=plan,
            title="Администратор прокомментировал план обучения",
            content={
                "list": [],
                "text": [plan.admin_comment]
            },
            buttons=[{"inner": f'План: {plan.name}',
                      "href": f"/learning_plans/{plan.id}/"}],
            user=request.user
        )
        return Response(
            data=LearningPlanListSerializer(instance=plan,
                                            many=False,
                                            context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )
