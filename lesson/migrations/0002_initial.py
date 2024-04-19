# Generated by Django 5.0.3 on 2024-04-16 15:57

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('lesson', '0001_initial'),
        ('material', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='lesson',
            name='materials',
            field=models.ManyToManyField(blank=True, related_name='lesson', related_query_name='lesson_set', to='material.material', verbose_name='Материалы'),
        ),
    ]