from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import Material
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .serializers import MaterialSerializer
from .utils.get_type import get_type
from learning_program.models import LearningProgramLesson, LearningProgramPhase


class MaterialListCreateAPIView(LoginRequiredMixin, ListCreateAPIView):
    serializer_class = MaterialSerializer

    def filter_queryset_programs(self, queryset):
        params = self.request.query_params
        progs = params.getlist('progs')
        phases = params.getlist('phases')
        lessons = params.getlist('lessons')
        if lessons:
            return queryset.filter(learning_program_lesson__in=lessons)
        if phases:
            lessons = LearningProgramLesson.objects.filter(learningprogramphase__id__in=phases)
            return queryset.filter(learning_program_lesson__in=lessons)
        if progs:
            phases = LearningProgramPhase.objects.filter(learningprogram__id__in=progs)
            lessons = LearningProgramLesson.objects.filter(learningprogramphase__id__in=phases)
            return queryset.filter(learning_program_lesson__in=lessons)
        return queryset

    def filter_queryset(self, queryset):
        params = self.request.query_params
        q_name = params.get('name')
        q_cat = params.getlist('cat')
        q_lvl = params.getlist('lvl')
        q_mat_type = params.getlist('typeMat')
        if q_name:
            queryset = queryset.filter(name__icontains=q_name)
        if q_cat:
            queryset = queryset.filter(category__in=q_cat)
        if q_lvl:
            queryset = queryset.filter(level__in=q_lvl)
        if q_mat_type:
            filtered = [m.id for m in
                        list(filter(lambda mat: get_type(mat.file.path.split(".")[-1]) in q_mat_type, queryset))]
            queryset = queryset.filter(id__in=filtered)
        return queryset

    def get_queryset(self):
        param_type = self.request.query_params.get('type')
        if not param_type or param_type == '1':
            if self.request.user.has_perm('material.see_all_general'):
                queryset = Material.objects.filter(type=1, visible=True)
            else:
                raise PermissionDenied
        elif param_type == "2":
            queryset = Material.objects.filter(type=2, owner=self.request.user, visible=True)
        else:
            queryset = None
        queryset = self.filter_queryset_programs(queryset)
        queryset = self.filter_queryset(queryset).distinct()
        return queryset

    def list(self, request, *args, **kwargs):
        offset = int(request.query_params.get('offset')) if request.query_params.get('offset') else 0
        queryset = self.get_queryset()[offset:offset+15]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class MaterialAPIView(LoginRequiredMixin, RetrieveUpdateDestroyAPIView):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

    def delete(self, request, *args, **kwargs):
        material = self.get_object()
        material.visible = False
        material.save()
        return Response({"status": 'success'}, status=status.HTTP_200_OK)
