# Generated by Django 5.0.3 on 2025-02-18 19:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('download_data', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='generatefilestasks',
            name='task_complete',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Дата и время выполнения'),
        ),
        migrations.AlterField(
            model_name='generatefilestasks',
            name='task_dt',
            field=models.DateTimeField(auto_now_add=True, verbose_name='Дата и время задания'),
        ),
    ]
