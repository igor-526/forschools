# Generated by Django 5.0.3 on 2024-05-10 14:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('learning_plan', '0006_learningplan_from_program'),
    ]

    operations = [
        migrations.AddField(
            model_name='learningplan',
            name='schedule',
            field=models.JSONField(blank=True, null=True, verbose_name='Расписание'),
        ),
    ]
