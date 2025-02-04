# Generated by Django 5.0.3 on 2024-12-23 07:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('homework', '0012_alter_homework_for_curator'),
    ]

    operations = [
        migrations.CreateModel(
            name='HomeworkGroups',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('homeworks', models.ManyToManyField(to='homework.homework', verbose_name='Домашние заания')),
            ],
            options={
                'verbose_name': 'Группа домашних заданий',
                'verbose_name_plural': 'Группы домашних заданий',
                'ordering': ['id'],
            },
        ),
    ]
