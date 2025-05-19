import os.path
from typing import List, Dict

from rest_framework.exceptions import PermissionDenied
from rest_framework.request import Request
from django.core.exceptions import BadRequest
from dls.settings import BASE_DIR
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from homework.models import Homework, HomeworkLog
from lesson.models import Lesson
from .models import Material, File
from rest_framework.generics import (ListCreateAPIView,
                                     RetrieveUpdateDestroyAPIView)
from .serializers import MaterialSerializer
from .utils import get_type_by_ext
from learning_program.models import (LearningProgramLesson,
                                     LearningProgramPhase)


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
            lessons = LearningProgramLesson.objects.filter(
                learningprogramphase__id__in=phases
            )
            return queryset.filter(learning_program_lesson__in=lessons)
        if progs:
            phases = LearningProgramPhase.objects.filter(
                learningprogram__id__in=progs
            )
            lessons = LearningProgramLesson.objects.filter(
                learningprogramphase__id__in=phases
            )
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
                        list(filter(lambda mat: get_type_by_ext(
                            mat.file.path.split(".")[-1]
                        ) in q_mat_type, queryset))]
            queryset = queryset.filter(id__in=filtered)
        return queryset

    def get_queryset(self):
        param_type = self.request.query_params.get('type')
        if not param_type or param_type == '1':
            if self.request.user.has_perm('material.see_all_general'):
                queryset = Material.objects.filter(type=1, visible=True)
            else:
                raise PermissionDenied()
        elif param_type == "2":
            queryset = Material.objects.filter(
                type=2, owner=self.request.user, visible=True
            )
        else:
            queryset = None
        queryset = self.filter_queryset_programs(queryset)
        queryset = self.filter_queryset(queryset).distinct()
        return queryset

    def list(self, request, *args, **kwargs):
        offset = int(request.query_params.get('offset')) if (
            request.query_params.get('offset')) else 0
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
        return Response(data={"status": 'success'},
                        status=status.HTTP_200_OK)


class MaterialFileTextAPIView(APIView):
    def get(self, request, *args, **kwargs):
        folder = request.query_params.get('folder')
        file = request.query_params.get('file')
        path = os.path.join(BASE_DIR, "media", folder, file)
        if not os.path.exists(path):
            return Response(status=status.HTTP_404_NOT_FOUND)
        data = "Не удалось определить кодировку"
        for encmode in ["utf-8", "utf-16", "cp1251"]:
            try:
                with open(path, "r", encoding=encmode) as f:
                    data = f.read()
                    break
            except (UnicodeDecodeError, UnicodeError):
                continue
        return Response(data=data, status=status.HTTP_200_OK)


class MaterialEditObjectAPIView(LoginRequiredMixin, APIView):
    def get_object(self, obj: str, pk: int) -> Homework | HomeworkLog | Lesson | None:
        model = None
        if obj == "hw":
            model = Homework
        elif obj == "hw_log":
            model = HomeworkLog
        elif obj == "lesson":
            model = Lesson
        if model is None:
            raise BadRequest("Модель данных не определена")
        return model.objects.get(pk=pk)

    def get_data(self, obj: str) -> List[int]:
        result = []
        model = None
        if obj in ("hw", "lesson"):
            model = Material
        elif obj == "hw_log":
            model = File
        if model is None:
            raise BadRequest("Модель данных не определена")
        for file in self.request.FILES.getlist("files"):
            query = {
                "owner": self.request.user,
                "name": ".".join(file.name.split(".")[:-1]),
                "extension": file.name.split(".")[-1],
                "is_animation": get_type_by_ext(file.name.split(".")[-1]) == "animation_formats"
            }
            if model == Material:
                query['file'] = file
            elif model == File:
                query['path'] = file
            mat = model.objects.create(**query)
            result.append(mat.id)
        if model == Material:
            for text in self.request.POST.getlist("text_materials"):
                name = f'{text[:35]}.txt'
                file = f"materials/{name}"
                try:
                    with open(f"media/{file}", 'w', encoding="utf-8") as f:
                        f.write(text)
                except Exception:
                    name = f'text_file{Material.objects.count() + 1}.txt'
                    file = f"materials/{name}"
                    with open(f"media/{file}", 'w', encoding="utf-8") as f:
                        f.write(text)
                mat = Material.objects.create(
                    owner=self.request.user,
                    name=name,
                    extension="txt",
                    is_animation=False,
                    file=file
                )
                result.append(mat.id)
        return result

    def add_data(self, file_ids: List[int],
                 obj: Homework | HomeworkLog | Lesson) \
            -> Dict[str, bool] | Dict[str, str | bool]:
        try:
            if isinstance(obj, (Homework, Lesson)):
                obj.materials.add(*file_ids)
                return {
                    "status": True
                }
            if isinstance(obj, HomeworkLog):
                obj.files.add(*file_ids)
                return {
                    "status": True
                }
            raise BadRequest("Не удалось добавить файлы")
        except BadRequest as e:
            return {
                "status": False,
                "error": str(e)
            }
        except Exception as e:
            return {
                "status": False,
                "error": str(e)
            }

    def delete_data(self,
                    obj: Homework | HomeworkLog | Lesson) \
            -> Dict[str, bool] | Dict[str, str | bool]:
        try:
            file_ids = [int(pk) for pk in self.request.data.getlist("pk")]
            if isinstance(obj, (Homework, Lesson)):
                obj.materials.remove(*file_ids)
                return {
                    "status": True
                }
            if isinstance(obj, HomeworkLog):
                obj.files.remove(*file_ids)
                return {
                    "status": True
                }
            raise BadRequest("Не удалось удалить файлы")
        except BadRequest as e:
            return {
                "status": False,
                "error": str(e)
            }
        except Exception as e:
            return {
                "status": False,
                "error": str(e)
            }

    def post(self, request: Request, obj_name: str, pk: int, *args, **kwargs):
        try:
            obj = self.get_object(obj_name, pk)
        except BadRequest as e:
            return Response(data={"error": str(e)},
                            status=status.HTTP_400_BAD_REQUEST)
        except Homework.DoesNotExist:
            return Response(data={"error": "Домашнее задание не найдено"},
                            status=status.HTTP_404_NOT_FOUND)
        except HomeworkLog.DoesNotExist:
            return Response(data={"error": "История ДЗ не найдена"},
                            status=status.HTTP_404_NOT_FOUND)
        except Lesson.DoesNotExist:
            return Response(data={"error": "Занятие не найдено"},
                            status=status.HTTP_404_NOT_FOUND)
        data_ids = self.get_data(obj_name)
        result = self.add_data(data_ids, obj)
        if result['status']:
            return Response(data={"status": 'ok'},
                            status=status.HTTP_200_OK)
        return Response(data={"error": result['error']},
                        status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request: Request, obj_name: str, pk: int, *args, **kwargs):
        try:
            obj = self.get_object(obj_name, pk)
        except BadRequest as e:
            return Response(data={"error": str(e)},
                            status=status.HTTP_400_BAD_REQUEST)
        except Homework.DoesNotExist:
            return Response(data={"error": "Домашнее задание не найдено"},
                            status=status.HTTP_404_NOT_FOUND)
        except HomeworkLog.DoesNotExist:
            return Response(data={"error": "История ДЗ не найдена"},
                            status=status.HTTP_404_NOT_FOUND)
        except Lesson.DoesNotExist:
            return Response(data={"error": "Занятие не найдено"},
                            status=status.HTTP_404_NOT_FOUND)
        result = self.delete_data(obj)
        if result['status']:
            return Response(data={"status": 'ok'},
                            status=status.HTTP_204_NO_CONTENT)
        return Response(data={"error": result['error']},
                        status=status.HTTP_400_BAD_REQUEST)
