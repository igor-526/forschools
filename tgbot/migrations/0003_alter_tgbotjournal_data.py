# Generated by Django 5.0.3 on 2024-08-19 16:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tgbot', '0002_alter_tgbotjournal_data'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tgbotjournal',
            name='data',
            field=models.JSONField(default=dict, verbose_name='Информация'),
        ),
    ]