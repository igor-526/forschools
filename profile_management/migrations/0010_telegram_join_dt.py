# Generated by Django 5.0.3 on 2024-10-09 09:37

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profile_management', '0009_telegram_usertype'),
    ]

    operations = [
        migrations.AddField(
            model_name='telegram',
            name='join_dt',
            field=models.DateTimeField(default=django.utils.timezone.now, verbose_name='Дата и время привязки'),
        ),
    ]
