# Generated by Django 5.0.3 on 2025-07-05 13:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_logs', '0009_userlog_files_db_userlog_materials_db'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userlog',
            name='log_type',
            field=models.IntegerField(choices=[(0, 'Другое'), (1, 'Работа методиста'), (2, 'Занятие'), (3, 'Учебный план'), (4, 'Домашнее задание'), (5, 'Комментарий администратора')], default=0, verbose_name='Тип события'),
        ),
    ]
