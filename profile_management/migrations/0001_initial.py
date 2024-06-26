# Generated by Django 5.0.3 on 2024-04-16 15:57

import django.contrib.auth.models
import django.contrib.auth.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='EngagementChannel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(verbose_name='Наименование')),
            ],
            options={
                'verbose_name': ('Канал привлечения',),
                'verbose_name_plural': ('Каналы привлечения',),
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Level',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(verbose_name='Наименование')),
            ],
            options={
                'verbose_name': ('Уровень',),
                'verbose_name_plural': ('Уровни',),
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='ListenerCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(verbose_name='Наименование')),
            ],
            options={
                'verbose_name': ('Категория учеников',),
                'verbose_name_plural': ('Категории учеников',),
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Programs',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(verbose_name='Наименование')),
            ],
            options={
                'verbose_name': ('Программа работы',),
                'verbose_name_plural': ('Программы работы',),
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='NewUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('photo', models.ImageField(blank=True, default='profile_pictures/base_avatar.png', upload_to='profile_pictures/', verbose_name='Фотография профиля')),
                ('last_activity', models.DateTimeField(auto_now_add=True, verbose_name='Последняя активность')),
                ('tg_code', models.IntegerField(blank=True, null=True, verbose_name='Код для присоединения Telegram')),
                ('bdate', models.DateField(blank=True, null=True, verbose_name='День рождения')),
                ('work_experience', models.CharField(blank=True, null=True, verbose_name='Опыт работы')),
                ('private_lessons', models.BooleanField(blank=True, null=True, verbose_name='Индивидуальные занятия')),
                ('group_lessons', models.BooleanField(blank=True, null=True, verbose_name='Групповые занятия')),
                ('note', models.TextField(blank=True, null=True, verbose_name='Примечание')),
                ('progress', models.CharField(blank=True, null=True, verbose_name='Прогресс')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
                ('engagement_channel', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='profile_management.engagementchannel', verbose_name='Канал привлечения')),
                ('level', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='profile_management.level', verbose_name='Уровень')),
                ('listener_category', models.ManyToManyField(blank=True, to='profile_management.listenercategory', verbose_name='Категории учеников')),
                ('programs', models.ManyToManyField(blank=True, to='profile_management.programs', verbose_name='Программы работы')),
            ],
            options={
                'verbose_name': 'Пользователь',
                'verbose_name_plural': 'Пользователи',
                'ordering': ['last_name', 'first_name'],
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Telegram',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tg_id', models.BigIntegerField(default=0, unique=True, verbose_name='id')),
                ('nickname', models.CharField(blank=True, null=True, verbose_name='ник')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='telegram', to=settings.AUTH_USER_MODEL, verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Привязанный Telegram',
                'verbose_name_plural': 'Привязанные Telegram',
                'ordering': ['user'],
            },
        ),
        migrations.CreateModel(
            name='UserLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dt', models.DateTimeField(auto_now_add=True, verbose_name='Дата и время')),
                ('comment', models.TextField(verbose_name='Комментарий')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='log', to=settings.AUTH_USER_MODEL, verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': ('Лог',),
                'verbose_name_plural': ('Логи',),
                'ordering': ['dt'],
            },
        ),
    ]
