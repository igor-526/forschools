from datetime import datetime

from download_data.models import GenerateFilesTasks
from download_data.permissions import CanSeeGeneratedData
from download_data.serializers import GenerateFilesTasksListSerializer

from lesson.tasks import lessons_download

from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView


class GeneratedListAPIView(CanSeeGeneratedData, ListAPIView):
    model = GenerateFilesTasks
    serializer_class = GenerateFilesTasksListSerializer

    def get_queryset(self, *args, **kwargs):
        query = {}
        task_type = self.request.query_params.getlist("type")
        task_initiators = self.request.query_params.getlist("initiator")
        task_dt_from = self.request.query_params.get("date_from")
        task_dt_to = self.request.query_params.get("date_to")
        task_complete = self.request.query_params.get("complete")
        if task_type:
            query['type__in'] = task_type
        if task_initiators:
            query['initiator__id__in'] = task_initiators
        if task_dt_from:
            task_dt_from = datetime.strptime(task_dt_from, "%Y-%m-%d").date()
            query['task_dt__date__gte'] = task_dt_from
        if task_dt_to:
            task_dt_to = datetime.strptime(task_dt_to, "%Y-%m-%d").date()
            query['task_dt__date__lte'] = task_dt_to
        if task_complete == "false":
            query['task_complete__isnull'] = True
        elif task_complete == "true":
            query['task_complete__isnull'] = False
        return GenerateFilesTasks.objects.filter(**query)


class GenerateNewData(CanSeeGeneratedData, APIView):
    def post(self, request, *args, **kwargs):
        filter_query = {}
        fields = []

        try:
            for key in request.POST.keys():
                if "filter_list_" in key:
                    filter_query[key] = request.POST.getlist(key)
                    continue
                if "filter_" in key:
                    filter_query[key] = request.POST.get(key)
                if request.POST.get(key) == "on":
                    fields.append(key)

            if kwargs.get("mode") == "lessons":
                task = GenerateFilesTasks.objects.create(
                    type=2,
                    initiator=request.user
                )
                lessons_download(filter_query, fields, task.id)
            return Response(data={"status": "ok"},
                            status=status.HTTP_200_OK)
        except Exception as e:
            return Response(data={"status": "error",
                                  "errors": [str(e)]},
                            status=status.HTTP_400_BAD_REQUEST)
