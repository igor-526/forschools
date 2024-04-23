from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, Http404
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .permissions import CanSeePlansPageMixin, can_edit_plan
from .models import LearningPlan, LearningPhases
from .serializers import LearningPlanListSerializer, LearningPhasesListSerializer
from dls.utils import get_menu


class PlansPageView(CanSeePlansPageMixin, TemplateView):
    template_name = 'plans_main.html'

    def get_teacher_set_permission(self):
        usergroups = [group.name for group in self.request.user.groups.all()]
        if ("Admin" in usergroups) or ("Metodist" in usergroups):
            return True
        return False

    def get(self, request, *args, **kwargs):
        context = {'title': 'Планы обучения',
                   'menu': get_menu(request.user),
                   'can_set_teacher': self.get_teacher_set_permission()}
        return render(request, self.template_name, context)


class PlansItemPageView(CanSeePlansPageMixin, TemplateView):
    template_name = 'plans_item.html'

    def get(self, request, *args, **kwargs):
        plan = LearningPlan.objects.get(pk=kwargs.get("pk"))
        context = {'title': plan.name,
                   'menu': get_menu(request.user),
                   'plan': plan,
                   'can_edit_plan': can_edit_plan(request, plan)}
        return render(request, self.template_name, context)


class PlansListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
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
        return JsonResponse(serializer.data, status=200, safe=False)

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
                return JsonResponse(serializer.data, status=201)
            else:
                return JsonResponse(serializer.data, status=400)
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
                return JsonResponse(serializer.data, status=201)
            else:
                return JsonResponse(serializer.data, status=400)
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
                return JsonResponse({"status": "ok"}, status=204)
        raise PermissionDenied
