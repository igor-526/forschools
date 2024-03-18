from django.db import models
from datetime import datetime
from profile_management.models import NewUser


MATERIAL_TYPE_CHOISES = (
    (1, 'Общие материалы'),
    (2, 'Индивидуальные материалы'),
)


class MaterialCategory(models.Model):
    name = models.CharField(verbose_name='Наименование',
                            unique=True)

    class Meta:
        verbose_name = 'Категория материалов'
        verbose_name_plural = 'Категории материалов'
        ordering = ['name']

    def __str__(self):
        return self.name


class Material(models.Model):
    owner = models.ForeignKey(NewUser,
                              verbose_name='Владелец',
                              on_delete=models.CASCADE,
                              related_name='material',
                              related_query_name='material_set',
                              null=False,
                              blank=True)
    name = models.CharField(verbose_name='Наименование',
                            max_length=200,
                            null=False,
                            blank=False,
                            unique=True)
    description = models.CharField(verbose_name='Описание',
                                   null=True,
                                   blank=True)
    file = models.FileField(verbose_name='Файл',
                            upload_to='static/materials/',
                            null=False,
                            blank=False)
    uploaded_at = models.DateTimeField(verbose_name='Дата и время загрузки',
                                       auto_now_add=True,
                                       null=False,
                                       blank=True)
    last_used_at = models.DateTimeField(verbose_name='Последнее использование',
                                        auto_now_add=True,
                                        null=False,
                                        blank=True)
    category = models.ManyToManyField(MaterialCategory,
                                      verbose_name='Категория',
                                      related_name='material',
                                      related_query_name='material_set',
                                      blank=True)
    type = models.IntegerField(choices=MATERIAL_TYPE_CHOISES,
                               verbose_name='Тип',
                               null=False,
                               blank=True,
                               default=2)
    moderated = models.BooleanField(verbose_name='Отмодерированный',
                                    default=True,
                                    null=True,
                                    blank=True)
    visible = models.BooleanField(verbose_name='Видимость материала',
                                  default=True,
                                  null=False,
                                  blank=True)

    class Meta:
        verbose_name = 'Материал'
        verbose_name_plural = 'Материалы'
        ordering = ['name']

    def __str__(self):
        return f'{self.name}'

    def update_last_used_at(self):
        self.last_used_at = datetime.now()

    def set_category(self, categories: list):
        if 'new' in categories:
            categories.remove('new')
        cat_list = []
        for cat in categories:
            if cat.strip(" ") != "":
                cat_list.append(MaterialCategory.objects.get_or_create(name=cat)[0])
        self.category.set(cat_list)


class File(models.Model):
    name = models.CharField(verbose_name='Наименование',
                            max_length=200,
                            null=False,
                            blank=False,
                            unique=True)
    path = models.FileField(verbose_name='Путь',
                            upload_to='files/',
                            null=False,
                            blank=False,
                            unique=True)
    owner = models.ForeignKey(NewUser,
                              verbose_name='Владелец',
                              on_delete=models.CASCADE,
                              null=True,
                              blank=True,
                              related_name='file',
                              related_query_name='file_set')
    uploaded_at = models.DateTimeField(verbose_name='Дата и время загрузки',
                                       auto_now_add=True,
                                       null=False,
                                       blank=True)
    last_used_at = models.DateTimeField(verbose_name='Последнее использование',
                                        auto_now_add=True,
                                        null=False,
                                        blank=True)

    class Meta:
        verbose_name = 'Файл'
        verbose_name_plural = 'Файлы'
        ordering = ['name']

    def __str__(self):
        return f'{self.name}'

    def update_last_used_at(self):
        self.last_used_at = datetime.now()
