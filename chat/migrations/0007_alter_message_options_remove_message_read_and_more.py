# Generated by Django 5.0.3 on 2024-10-16 15:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0006_groupchats_users_tg'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='message',
            options={'ordering': ['-date'], 'verbose_name': 'Сообщение', 'verbose_name_plural': 'Сообщения'},
        ),
        migrations.RemoveField(
            model_name='message',
            name='read',
        ),
        migrations.AddField(
            model_name='message',
            name='read_data',
            field=models.JSONField(default=dict, verbose_name='Прочитано'),
        ),
        migrations.AlterField(
            model_name='groupchats',
            name='name',
            field=models.CharField(max_length=52, unique=True, verbose_name='Наименование'),
        ),
        migrations.AlterField(
            model_name='groupchats',
            name='photo',
            field=models.ImageField(blank=True, default='profile_pictures/base_chat_avatar.png', upload_to='profile_pictures/', verbose_name='Фотография чата'),
        ),
    ]