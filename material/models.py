from django.db import models
from datetime import datetime
from profile_management.models import NewUser


class MaterialCategory(models.Model):
    name = models.CharField(verbose_name='Наименование')

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
                              blank=False)
    name = models.CharField(verbose_name='Наименование',
                            max_length=200,
                            null=False,
                            blank=False,
                            unique=True)
    file = models.FileField(verbose_name='Файл',
                            upload_to='materials/',
                            null=False,
                            blank=False)
    uploaded_at = models.DateTimeField(verbose_name='Дата и время загрузки',
                                       auto_now_add=True,
                                       null=False,
                                       blank=False)
    last_used_at = models.DateTimeField(verbose_name='Последнее использование',
                                        auto_now_add=True,
                                        null=False,
                                        blank=False)
    category = models.ManyToManyField(MaterialCategory,
                                      verbose_name='Категория',
                                      related_name='material',
                                      related_query_name='material_set')

    class Meta:
        verbose_name = 'Материал'
        verbose_name_plural = 'Материалы'
        ordering = ['name']

    def __str__(self):
        return f'{self.name}'

    def update_last_used_at(self):
        self.last_used_at = datetime.now()


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
                              related_name='file',
                              related_query_name='file_set')
    uploaded_at = models.DateTimeField(verbose_name='Дата и время загрузки',
                                       auto_now_add=True,
                                       null=False,
                                       blank=False)
    last_used_at = models.DateTimeField(verbose_name='Последнее использование',
                                        auto_now_add=True,
                                        null=False,
                                        blank=False)

    class Meta:
        verbose_name = 'Файл'
        verbose_name_plural = 'Файлы'
        ordering = ['name']

    def __str__(self):
        return f'{self.name}'

    def update_last_used_at(self):
        self.last_used_at = datetime.now()
