# Generated by Django 5.0.3 on 2024-10-04 13:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0002_alter_wsgierrorslog_params'),
    ]

    operations = [
        migrations.AddField(
            model_name='wsgierrorslog',
            name='traceback_log',
            field=models.JSONField(default=list, verbose_name='Трейсбэк'),
        ),
    ]
