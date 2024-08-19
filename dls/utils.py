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
        {'name': 'Cообщения', 'url': reverse('chats'), 'type': 'main'},
        {'name': 'Материалы', 'url': reverse('materials'), 'type': 'main'},
        {'name': 'Шаблоны уроков', 'url': reverse('learning_programs'), 'type': 'main'},
        {'name': 'Планы обучения', 'url': reverse('learning_plans'), 'type': 'main'},
        {'name': 'Занятия', 'url': reverse('lessons'), 'type': 'main'},
        {'name': 'Домашние задания', 'url': reverse('homeworks'), 'type': 'main'},
        {'name': 'Администрирование', 'type': 'dropdown', 'menu': [
            {'name': 'Управление пользователями', 'url': reverse('admin_users')},
            {'name': 'Коллекция данных', 'url': reverse('admin_collections')},
            {'name': 'Журнал Telegram', 'url': reverse('tgjournal')},
        ]},
        {'name': 'Выйти', 'url': reverse('logout'), 'type': 'main'},
    ]
    teacher_menu = [
        {'name': 'Главная', 'url': reverse('dashboard'), 'type': 'main'},
        {'name': 'Профиль', 'url': reverse('profile'), 'type': 'main'},
        {'name': 'Cообщения', 'url': reverse('chats'), 'type': 'main'},
        {'name': 'Материалы', 'url': reverse('materials'), 'type': 'main'},
        {'name': 'Шаблоны уроков', 'url': reverse('learning_programs'), 'type': 'main'},
        {'name': 'Планы обучения', 'url': reverse('learning_plans'), 'type': 'main'},
        {'name': 'Занятия', 'url': reverse('lessons'), 'type': 'main'},
        {'name': 'Домашние задания', 'url': reverse('homeworks'), 'type': 'main'},
        {'name': 'Администрирование', 'type': 'dropdown', 'menu': [
            {'name': 'Управление пользователями', 'url': reverse('admin_users')},
            {'name': 'Журнал Telegram', 'url': reverse('tgjournal')},
        ]},
        {'name': 'Выйти', 'url': reverse('logout'), 'type': 'main'},
    ]
    listener_menu = [
        {'name': 'Главная', 'url': reverse('dashboard'), 'type': 'main'},
        {'name': 'Профиль', 'url': reverse('profile'), 'type': 'main'},
        {'name': 'Cообщения', 'url': reverse('chats'), 'type': 'main'},
        {'name': 'Занятия', 'url': reverse('lessons'), 'type': 'main'},
        {'name': 'Домашние задания', 'url': reverse('homeworks'), 'type': 'main'},
        {'name': 'Выйти', 'url': reverse('logout'), 'type': 'main'},
    ]
    if user.groups.filter(name__in=["Metodist", "Admin"]).exists():
        return admin_menu
    if user.groups.filter(name="Teacher").exists():
        return teacher_menu
    if user.groups.filter(name="Listener").exists():
        return listener_menu
