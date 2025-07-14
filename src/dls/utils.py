import traceback

from django.db.models import Q
from django.urls import reverse

from profile_management.models import Telegram


def get_tg_id_sync(user_id: int):
    return Telegram.objects.filter(
        Q(allowed_users=user_id) | Q(allowed_parents=user_id)
    ).values_list("tg_id", flat=True)


def get_menu(user):
    unread_messages_count = user.get_unread_messages_count()
    superuser_menu = [
        {'name': 'Главная',
         'url': reverse('dashboard'), 'type': 'main'},
        {'name': 'Профиль',
         'url': reverse('profile'), 'type': 'main'},
        {'name': f'Cообщения ({unread_messages_count})',
         'type': 'dropdown',
         'menu': [
             {'name': 'Cообщения',
              'url': reverse('chats')},
             {'name': 'Cообщения администратору',
              'url': reverse('admin_chats')},
             {'name': 'Неотправленные сообщения',
              'url': reverse('unsent_chats')},
         ]},
        {'name': 'Материалы',
         'url': reverse('materials'),
         'type': 'main'},
        {'name': 'Шаблоны уроков',
         'url': reverse('learning_programs'),
         'type': 'main'},
        {'name': 'Планы обучения',
         'url': reverse('learning_plans'),
         'type': 'main'},
        {'name': 'Занятия',
         'url': reverse('lessons'),
         'type': 'main'},
        {'name': 'Домашние задания',
         'url': reverse('homeworks'),
         'type': 'main'},
        {'name': 'Администр.',
         'type': 'dropdown',
         'menu': [
             {'name': 'Управление пользователями',
              'url': reverse('admin_users')},
             {'name': 'Коллекция данных',
              'url': reverse('admin_collections')},
         ]},
        {'name': 'Журналы',
         'type': 'dropdown',
         'menu': [
             {'name': 'Выгрузка данных',
              'url': reverse('generated')},
             {'name': 'Журнал Telegram',
              'url': reverse('tgjournal')},
             {'name': 'Журнал событий пользователей',
              'url': reverse('events_journal')},
             {'name': 'Логи пользователей',
              'url': reverse('user_logs')},
             {'name': 'Ошибки WSGI',
              'url': reverse('wsgierrors')},
             {'name': 'Ошибки Telegram',
              'url': reverse('telegramerrors')},
         ]},
        {'name': 'Техподдержка',
         'type': 'dropdown',
         'menu': [
             {'name': 'Тикеты',
              'url': reverse('supporttickets')},
         ]},
        {'name': 'Выйти',
         'url': reverse('logout'), 'type': 'main'},
    ]
    admin_menu = [
        {'name': 'Главная',
         'url': reverse('dashboard'),
         'type': 'main'},
        {'name': 'Профиль',
         'url': reverse('profile'),
         'type': 'main'},
        {'name': f'Cообщения ({unread_messages_count})',
         'type': 'dropdown',
         'menu': [
             {'name': 'Cообщения',
              'url': reverse('chats')},
             {'name': 'Cообщения администратору',
              'url': reverse('admin_chats')},
             {'name': 'Неотправленные сообщения',
              'url': reverse('unsent_chats')},
         ]},
        {'name': 'Материалы',
         'url': reverse('materials'),
         'type': 'main'},
        {'name': 'Шаблоны уроков',
         'url': reverse('learning_programs'),
         'type': 'main'},
        {'name': 'Планы обучения',
         'url': reverse('learning_plans'),
         'type': 'main'},
        {'name': 'Занятия',
         'url': reverse('lessons'),
         'type': 'main'},
        {'name': 'Домашние задания',
         'url': reverse('homeworks'),
         'type': 'main'},
        {'name': 'Техподдержка',
         'url': "#",
         'type': 'main',
         'id': 'forschoolsSupport'},
        {'name': 'Администр.',
         'type': 'dropdown',
         'menu': [
             {'name': 'Управление пользователями',
              'url': reverse('admin_users')},
             {'name': 'Коллекция данных',
              'url': reverse('admin_collections')},
         ]},
        {'name': 'Журналы',
         'type': 'dropdown',
         'menu': [
             {'name': 'Выгрузка данных',
              'url': reverse('generated')},
             {'name': 'Журнал Telegram',
              'url': reverse('tgjournal')},
             {'name': 'Логи пользователей',
              'url': reverse('user_logs')},
             {'name': 'Журнал событий пользователей',
              'url': reverse('events_journal')},
             {'name': 'Ошибки WSGI',
              'url': reverse('wsgierrors')},
             {'name': 'Ошибки Telegram',
              'url': reverse('telegramerrors')},
         ]},
        {'name': 'Выйти',
         'url': reverse('logout'),
         'type': 'main'},
    ]
    teacher_menu = [
        {'name': 'Главная',
         'url': reverse('dashboard'),
         'type': 'main'},
        {'name': 'Профиль',
         'url': reverse('profile'),
         'type': 'main'},
        {'name': f'Cообщения ({unread_messages_count})',
         'url': reverse('chats'),
         'type': 'main'},
        {'name': 'Шаблоны уроков',
         'url': reverse('learning_programs'),
         'type': 'main'},
        {'name': 'Планы обучения',
         'url': reverse('learning_plans'),
         'type': 'main'},
        {'name': 'Занятия',
         'url': reverse('lessons'),
         'type': 'main'},
        {'name': 'Домашние задания',
         'url': reverse('homeworks'),
         'type': 'main'},
        {'name': 'Техподдержка',
         'url': "#",
         'type': 'main',
         'id': 'forschoolsSupport'},
        {'name': 'Выйти',
         'url': reverse('logout'),
         'type': 'main'},
    ]
    listener_menu = [
        {'name': 'Главная',
         'url': reverse('dashboard'),
         'type': 'main'},
        {'name': 'Профиль',
         'url': reverse('profile'),
         'type': 'main'},
        {'name': f'Cообщения ({unread_messages_count})',
         'url': reverse('chats'),
         'type': 'main'},
        {'name': 'Занятия',
         'url': reverse('lessons'),
         'type': 'main'},
        {'name': 'Домашние задания',
         'url': reverse('homeworks'),
         'type': 'main'},
        {'name': 'Техподдержка',
         'url': "#",
         'type': 'main',
         'id': 'forschoolsSupportButton'},
        {'name': 'Выйти',
         'url': reverse('logout'),
         'type': 'main'},
    ]
    if user.is_superuser:
        menu = superuser_menu
    elif user.groups.filter(name__in=["Metodist", "Admin"]).exists():
        menu = admin_menu
    elif user.groups.filter(name__in=["Teacher", "Curator"]).exists():
        menu = teacher_menu
    elif user.groups.filter(name="Listener").exists():
        menu = listener_menu
    else:
        menu = None
    if user.user_permissions.filter(codename="mailing_access").exists():
        admin_dropdown_index = next(
            (index for (index, d) in enumerate(menu) if
             d["name"] == "Администр."), None
        )
        if admin_dropdown_index:
            menu[admin_dropdown_index]["menu"].append(
                {'name': 'Рассылки', 'url': reverse('mailing')}
            )
        else:
            menu.insert(-1, {
                'name': 'Администр.',
                'type': 'dropdown',
                'menu': [
                    {'name': 'Рассылки',
                     'url': reverse('mailing')},
                ]})
    return menu


def get_traceback(exception):
    tb = exception.__traceback__
    traceback_log = traceback.format_exception(type(exception),
                                               exception,
                                               tb)
    traceback_log = list(filter(
        lambda s: len(s) != s.count("^") + s.count(" "), traceback_log
    ))
    return traceback_log
