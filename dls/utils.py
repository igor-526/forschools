from profile_management.models import Telegram
from django.urls import reverse


def get_tg_id_sync(user_id: int, usertype=None):
    if usertype:
        tg = Telegram.objects.filter(user__id=user_id,
                                     usertype=usertype).first()
        if tg:
            return tg.tg_id
        else:
            return None
    else:
        tg_ids = [{"tg_id": tgnote.tg_id,
                   "usertype": tgnote.usertype} for tgnote in Telegram.objects.filter(user__id=user_id).all()]
        return tg_ids


def get_menu(user):
    superuser_menu = [
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
        {'name': 'Техподдержка', 'type': 'dropdown', 'menu': [
            {'name': 'Тикеты', 'url': reverse('supporttickets')},
            {'name': 'Ошибки WSGI', 'url': reverse('wsgierrors')},
            {'name': 'Ошибки Telegram', 'url': "#"},
        ]},
        {'name': 'Выйти', 'url': reverse('logout'), 'type': 'main'},
    ]
    admin_menu = [
        {'name': 'Главная', 'url': reverse('dashboard'), 'type': 'main'},
        {'name': 'Профиль', 'url': reverse('profile'), 'type': 'main'},
        {'name': 'Cообщения', 'url': reverse('chats'), 'type': 'main'},
        {'name': 'Материалы', 'url': reverse('materials'), 'type': 'main'},
        {'name': 'Шаблоны уроков', 'url': reverse('learning_programs'), 'type': 'main'},
        {'name': 'Планы обучения', 'url': reverse('learning_plans'), 'type': 'main'},
        {'name': 'Занятия', 'url': reverse('lessons'), 'type': 'main'},
        {'name': 'Домашние задания', 'url': reverse('homeworks'), 'type': 'main'},
        {'name': 'Техподдержка', 'url': "#", 'type': 'main', 'id': 'forschoolsSupport'},
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
        {'name': 'Техподдержка', 'url': "#", 'type': 'main', 'id': 'forschoolsSupport'},
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
        {'name': 'Техподдержка', 'url': "#", 'type': 'main', 'id': 'forschoolsSupportButton'},
        {'name': 'Выйти', 'url': reverse('logout'), 'type': 'main'},
    ]
    if user.is_superuser:
        return superuser_menu
    if user.groups.filter(name__in=["Metodist", "Admin"]).exists():
        return admin_menu
    if user.groups.filter(name="Teacher").exists():
        return teacher_menu
    if user.groups.filter(name="Listener").exists():
        return listener_menu
