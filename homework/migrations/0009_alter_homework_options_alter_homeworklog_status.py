# Generated by Django 5.0.3 on 2024-10-01 18:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('homework', '0008_homework_from_programs_hw'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='homework',
            options={'ordering': ['-id'], 'verbose_name': 'Домашнее задание', 'verbose_name_plural': 'Домашние задания'},
        ),
        migrations.AlterField(
            model_name='homeworklog',
            name='status',
            field=models.IntegerField(choices=[(1, 'Создано'), (2, 'Открыто'), (3, 'На проверке'), (4, 'Принято'), (5, 'На доработке'), (6, 'Отменено'), (7, 'Задано')], default=1, verbose_name='Статус'),
        ),
    ]