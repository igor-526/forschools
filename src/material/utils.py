from typing import Any, List

from django.core.files.uploadedfile import InMemoryUploadedFile

from dls.settings import MATERIAL_FORMATS

from profile_management.models import NewUser

from .models import File, Material


class MaterialFileUploader:
    mode: str
    objects: List[Material] | List[File]
    files: List[InMemoryUploadedFile]
    text_materials = List[str]
    owner: NewUser

    def __init__(self, owner: NewUser, mode: str = "m"):
        self.mode = mode
        self.objects = []
        self.files = []
        self.text_materials = []
        self.owner = owner

    def set_files(self, files: List[InMemoryUploadedFile]) -> None:
        self.files = files
        return None

    def set_text_materials(self, text_materials: List[str]) -> None:
        self.text_materials = text_materials
        return None

    def upload(self) -> dict[str, str | bool] | Any:
        try:
            model = None
            if self.mode == "m":
                model = Material
            elif self.mode == "f":
                model = File
            if model is None:
                return {
                    "status": False,
                    "error": "Не удалось определить модель данных"
                }
            for file in self.files:
                query = {
                    "owner": self.owner,
                    "name": ".".join(file.name.split(".")[:-1]),
                    "extension": file.name.split(".")[-1],
                    "is_animation": get_type_by_ext(
                        file.name.split(".")[-1]) == "animation_formats"
                }
                if model == Material:
                    query['file'] = file
                elif model == File:
                    query['path'] = file
                mat = model.objects.create(**query)
                self.objects.append(mat)
            if model == Material:
                for text in self.text_materials:
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
                        owner=self.owner,
                        name=name,
                        extension="txt",
                        is_animation=False,
                        file=file
                    )
                    self.objects.append(mat)
            return {
                "status": True,
                "error": None
            }
        except Exception as e:
            return {
                "status": False,
                "error": str(e)
            }


def get_type_by_ext(extension: str):
    for mat_type in MATERIAL_FORMATS:
        if extension and extension.lower() in MATERIAL_FORMATS.get(mat_type):
            return mat_type
    return "unsupported"
