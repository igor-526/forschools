# Generated by Django 5.0.3 on 2025-01-13 14:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_logs', '0005_userlog_color_userlog_learning_plan'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userlog',
            name='log_type',
            field=models.IntegerField(choices=[(0, 'Другое'), (1, 'Работа методиста'), (2, 'Занятие'), (3, 'Учебный план')], default=0, verbose_name='Тип события'),
        ),
    ]
