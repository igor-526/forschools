# Generated by Django 5.0.3 on 2024-10-12 15:08

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0004_alter_message_receiver_tg_alter_message_sender_tg'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='GroupChats',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True, verbose_name='Наименование')),
                ('photo', models.ImageField(blank=True, default='profile_pictures/base_сhat_avatar.png', upload_to='profile_pictures/', verbose_name='Фотография чата')),
                ('administrators', models.ManyToManyField(related_name='group_chats_admin', to=settings.AUTH_USER_MODEL, verbose_name='Пользователи')),
                ('messages', models.ManyToManyField(related_name='group_chats_messages', to='chat.message', verbose_name='Сообщения')),
                ('owner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='group_chats_owner', to=settings.AUTH_USER_MODEL, verbose_name='Владелец')),
                ('users', models.ManyToManyField(related_name='group_chats', to=settings.AUTH_USER_MODEL, verbose_name='Пользователи')),
            ],
        ),
    ]