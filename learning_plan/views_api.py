from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import Http404
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from homework.models import Homework, HomeworkLog
from lesson.models import Lesson
from .permissions import can_edit_plan, can_generate_from_program
from .models import LearningPlan, LearningPhases
from .serializers import LearningPlanListSerializer, LearningPhasesListSerializer
from .utils import plan_calculated_info, ProgramSetter, get_schedule, AddLessons
from learning_program.models import LearningProgram
from datetime import datetime


class PlansItemStatusAPIView(LoginRequiredMixin, APIView):
    def get(self, request, *args, **kwargs):
        plan = LearningPlan.objects.get(pk=kwargs.get('pk'))
        phases_passed = 0
        lessons_all = Lesson.objects.filter(learningphases__learningplan=plan).count()
        lessons_passed = Lesson.objects.filter(learningphases__learningplan=plan,
                                               status__in=[1, 2]).count()
        return Response({
            "phases_passed": phases_passed,
            "lessons_all": lessons_all,
            "lessons_passed": lessons_passed,
            "can_close": lessons_all != lessons_passed and
                         request.user.groups.filter(name__in=["Metodist", "Admin"]).exists()
        })

    def post(self, request, *args, **kwargs):
        plan = LearningPlan.objects.get(pk=kwargs.get('pk'))
        lessons = Lesson.objects.filter(learningphases__learningplan=plan,
                                        status=0).all()
        homeworks = Homework.objects.filter(lesson__in=[l.id for l in lessons])
        hwlogs = HomeworkLog.objects.filter(homework__in=[h.id for h in homeworks])
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
        return Response({"status": "success"}, status=200)


class PlansListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = LearningPlanListSerializer

    def filter_name(self, queryset):
        q_name = self.request.query_params.get('name')
        if q_name:
            queryset = queryset.filter(name__icontains=q_name)
        return queryset

    def filter_teacher(self, queryset):
        q_teacher = self.request.query_params.getlist('teacher')
        if q_teacher:
            queryset = queryset.filter(teacher__id__in=q_teacher)
        return queryset

    def filter_listeners(self, queryset):
        q_listeners = self.request.query_params.getlist('listener')
        if q_listeners:
            queryset = queryset.filter(listeners__id__in=q_listeners)
        return queryset

    def order_by_name(self, queryset):
        order_name = self.request.query_params.get('sort_name')
        if order_name == "asc":
            queryset = queryset.order_by('name')
        elif order_name == "desc":
            queryset = queryset.order_by('-name')
        return queryset

    def get_queryset(self):
        queryset = None
        if self.request.user.groups.filter(name__in=["Admin", "Metodist"]).exists():
            queryset = LearningPlan.objects.all()
        elif self.request.user.groups.filter(name="Teacher").exists():
            queryset = LearningPlan.objects.filter(teacher=self.request.user)
        queryset = self.filter_name(queryset)
        queryset = self.filter_teacher(queryset)
        queryset = self.filter_listeners(queryset)
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
        queryset = LearningPlan.objects.get(pk=kwargs.get("plan_pk")).phases.all()
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset(plan_pk=self.kwargs.get("plan_pk"))
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=200)

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
                return Response(serializer.data, status=201)
            else:
                return Response(serializer.data, status=400)
        else:
            raise PermissionDenied


class PlanPhaseItemAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = LearningPhasesListSerializer

    def get_object(self, *args, **kwargs):
        obj = LearningPhases.objects.get(pk=kwargs.get("phase_pk"))
        return obj

    def patch(self, request, *args, **kwargs):
        try:
            phase = self.get_object(phase_pk=kwargs.get("pk"))
        except LearningPhases.DoesNotExist:
            raise Http404
        if can_edit_plan(request, phase=phase):
            serializer = self.get_serializer(data=request.data,
                                             instance=phase,
                                             context={"plan": phase.learningplan_set.first()})
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(serializer.data, status=201)
            else:
                return Response(serializer.data, status=400)
        else:
            raise PermissionDenied

    def delete(self, request, *args, **kwargs):
        try:
            phase = self.get_object(phase_pk=kwargs.get("pk"))
        except LearningPhases.DoesNotExist:
            raise Http404
        if can_edit_plan(request, phase=phase):
            if phase.lessons.count() == 0:
                phase.delete()
                return Response({"status": "ok"}, status=204)
        raise PermissionDenied


class PlansItemSetProgramAPIView(LoginRequiredMixin, APIView):
    def get(self, request, *args, **kwargs):
        program = LearningProgram.objects.get(pk=request.query_params.get("programID"))
        return Response(plan_calculated_info(
            datetime.strptime(request.query_params.get("date_start"), "%Y-%m-%d"),
            get_schedule(request.query_params),
            program
        ), status=200)

    def post(self, request, *args, **kwargs):
        program = LearningProgram.objects.get(pk=request.POST.get("programID"))
        plan = LearningPlan.objects.get(pk=kwargs.get("plan_pk"))
        if can_generate_from_program(request, plan):
            setter = ProgramSetter(
                datetime.strptime(request.POST.get("date_start"), "%Y-%m-%d"),
                get_schedule(request.POST),
                program,
                plan
            )
            setter.set_program()
            return Response({"status": "ok"}, status=201)
        else:
            return Response({"error": "Вы не можете сгенерировать план на основе программы"}, status=400)


class PlanItemAddLessonsAPIView(LoginRequiredMixin, APIView):
    def post(self, request, *args, **kwargs):
        plan = LearningPlan.objects.get(pk=kwargs.get("plan_pk"))
        lessons_generator = AddLessons(
            datetime.strptime(request.POST.get("date_start"), "%Y-%m-%d"),
            get_schedule(request.POST),
            plan
        )
        lessons_generator.add_lessons()
        return Response({"status": "ok"}, status=201)
