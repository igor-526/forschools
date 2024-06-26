# Generated by Django 5.0.3 on 2024-04-16 15:57

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('learning_plan', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='learningplan',
            name='listeners',
            field=models.ManyToManyField(related_name='plan_listeners', to=settings.AUTH_USER_MODEL, verbose_name='Ученики'),
        ),
        migrations.AddField(
            model_name='learningplan',
            name='phases',
            field=models.ManyToManyField(blank=True, to='learning_plan.learningphases', verbose_name='Этапы обучения'),
        ),
        migrations.AddField(
            model_name='learningplan',
            name='teacher',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='Преподаватель'),
        ),
    ]
