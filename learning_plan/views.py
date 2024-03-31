from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from .models import LearningPlan, LearningPhases
from .serializers import LearningPlanListSerializer, LearningPhasesListSerializer

from dls.utils import get_menu
from json import dumps


class PlansPageView(LoginRequiredMixin, TemplateView):
    template_name = 'plans_main.html'

    def get(self, request, *args, **kwargs):
        perms = request.user.get_group_permissions()
        filtered_perms = [perm for perm in perms if "lesson." in perm]
        context = {'title': 'Планы обучения',
                   'menu': get_menu(request.user),
                   'userperms': dumps(filtered_perms)}
        return render(request, self.template_name, context)


class PlansItemPageView(LoginRequiredMixin, TemplateView):
    template_name = 'plans_item.html'

    def get(self, request, *args, **kwargs):
        perms = request.user.get_group_permissions()
        filtered_perms = [perm for perm in perms if "lesson." in perm]
        plan = LearningPlan.objects.get(pk=kwargs.get("pk"))
        context = {'title': plan.name,
                   'menu': get_menu(request.user),
                   'userperms': dumps(filtered_perms),
                   'plan': plan}
        return render(request, self.template_name, context)


class PlansListView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = LearningPlanListSerializer

    def get_queryset(self):
        queryset = LearningPlan.objects.all()
        return queryset


class PlanPhasesAPIView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = LearningPhasesListSerializer

    def get_queryset(self, *args, **kwargs):
        queryset = LearningPlan.objects.get(pk=kwargs.get("plan_pk")).phases.all()
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset(plan_pk=self.kwargs.get("plan_pk"))
        serializer = self.get_serializer(queryset, many=True)
        return JsonResponse(serializer.data, status=200, safe=False)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data,
                                         context={"plan_pk": kwargs.get("plan_pk")})
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        else:
            return JsonResponse(serializer.data, status=400)


class PlanPhaseItemAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = LearningPhasesListSerializer

    def get_object(self, *args, **kwargs):
        obj = LearningPhases.objects.get(pk=kwargs.get("phase_pk"))
        return obj

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data,
                                         instance=self.get_object(phase_pk=kwargs.get("pk")),
                                         context={"plan_pk": kwargs.get("plan_pk")})
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        else:
            return JsonResponse(serializer.data, status=400)
