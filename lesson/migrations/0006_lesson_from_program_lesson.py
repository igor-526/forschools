# Generated by Django 5.0.3 on 2024-07-21 06:19

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('learning_program', '0003_learningprogramhomework_materials_comment'),
        ('lesson', '0005_alter_place_options_alter_lesson_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='lesson',
            name='from_program_lesson',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='learning_program.learningprogramlesson', verbose_name='Шаблон урока программы'),
        ),
    ]