from profile_management.models import NewUser, Telegram
from django.urls import reverse


def get_tg_id_sync(user: NewUser) -> int | None:
    tg = Telegram.objects.filter(user=user).first()
    if tg:
        return tg.tg_id
    else:
        return None


def get_menu(user):
    admin_menu = [
        {'name': 'Главная', 'url': reverse('dashboard'), 'type': 'main'},
        {'name': 'Профиль', 'url': reverse('profile'), 'type': 'main'},
        {'name': 'Уроки', 'url': reverse('lessons'), 'type': 'main'},
        {'name': 'Материалы', 'url': reverse('materials'), 'type': 'main'},
        {'name': 'Домашние задания', 'url': reverse('homeworks'), 'type': 'main'},
        {'name': 'Инструменты', 'type': 'dropdown', 'menu': [
                {'name': 'Управление пользователями', 'url': reverse('admin_users')},
                {'name': 'Коллекция данных', 'url': reverse('admin_collections')},
        ]},
        {'name': 'Выйти', 'url': reverse('logout'), 'type': 'main'},
    ]
    metodist_menu = [
        {'name': 'Главная', 'url': reverse('dashboard'), 'type': 'main'},
        {'name': 'Профиль', 'url': reverse('profile'), 'type': 'main'},
        {'name': 'Уроки', 'url': reverse('lessons'), 'type': 'main'},
        {'name': 'Материалы', 'url': reverse('materials'), 'type': 'main'},
        {'name': 'Домашние задания', 'url': reverse('homeworks'), 'type': 'main'},
        {'name': 'Инструменты', 'type': 'dropdown', 'menu': [
                {'name': 'Управление пользователями', 'url': reverse('admin_users')},
                {'name': 'Коллекция данных', 'url': reverse('admin_collections')},
        ]},
        {'name': 'Выйти', 'url': reverse('logout'), 'type': 'main'},
    ]
    teacher_menu = [
        {'name': 'Главная', 'url': reverse('dashboard'), 'type': 'main'},
        {'name': 'Профиль', 'url': reverse('profile'), 'type': 'main'},
        {'name': 'Уроки', 'url': reverse('lessons'), 'type': 'main'},
        {'name': 'Материалы', 'url': reverse('materials'), 'type': 'main'},
        {'name': 'Домашние задания', 'url': reverse('homeworks'), 'type': 'main'},
        {'name': 'Выйти', 'url': reverse('logout'), 'type': 'main'},
    ]
    listener_menu = [
        {'name': 'Главная', 'url': reverse('dashboard'), 'type': 'main'},
        {'name': 'Профиль', 'url': reverse('profile'), 'type': 'main'},
        {'name': 'Уроки', 'url': reverse('lessons'), 'type': 'main'},
        {'name': 'Домашние задания', 'url': reverse('homeworks'), 'type': 'main'},
        {'name': 'Выйти', 'url': reverse('logout'), 'type': 'main'},
    ]
    if user.groups.first().name == "Listener":
        return listener_menu
    elif user.groups.first().name == "Metodist":
        return metodist_menu
    elif user.groups.first().name == "Teacher":
        return teacher_menu
    elif user.groups.first().name == "Admin":
        return admin_menu
