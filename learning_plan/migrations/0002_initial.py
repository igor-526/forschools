# Generated by Django 5.0.3 on 2024-04-16 15:57

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('learning_plan', '0001_initial'),
        ('lesson', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='learningphases',
            name='lessons',
            field=models.ManyToManyField(blank=True, to='lesson.lesson', verbose_name='Занятия'),
        ),
    ]
