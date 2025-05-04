from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView
from dls.utils import get_menu
from json import dumps
from django.http import Http404
from .permissions import CanSeeUserPageMixin, CanSeeEventJournalMixin
from .models import NewUser


class DashboardPageTemplateView(LoginRequiredMixin, TemplateView):
    template_name = "dashboard.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Дэшборд', 'menu': get_menu(request.user)}
        return render(request, self.template_name, context)


class ProfilePageTemplateView(LoginRequiredMixin, TemplateView):
    template_name = "profile/profile.html"

    def get(self, request, *args, **kwargs):
        user_object = {
            'first_name': None,
            'last_name': None,
            'photo': None,
            'role': None,
            'last_activity': None,
            'date_joined': None,
            'bdate': None,
            'private_lessons': None,
            'group_lessons': None,
            'note': None,
            'progress': None,
            'level': None,
            'age': None,
            'id': None,
            'email': None,
            'tg': False
        }
        if self.kwargs.get('pk'):
            puser = NewUser.objects.filter(id=self.kwargs.get('pk')).first()
        else:
            puser = request.user
        if puser:
            user_object['first_name'] = puser.first_name
            user_object['last_name'] = puser.last_name
            user_object['photo'] = puser.photo.url
            user_object['last_activity'] = puser.last_activity
            user_object['date_joined'] = puser.date_joined
            user_object['id'] = puser.id
            user_object['bdate'] = puser.bdate
            user_object['email'] = puser.email
            role = puser.groups.first().name
            perms = request.user.get_all_permissions()
            if role == 'Admin':
                user_object['role'] = 'Администратор'
                if 'auth.see_moreinfo_admin' in perms:
                    user_object['note'] = puser.note
            if role == 'Metodist':
                user_object['role'] = 'Методист'
                if 'auth.see_moreinfo_metodist' in perms:
                    user_object['note'] = puser.note
            if role == 'Teacher':
                user_object['role'] = 'Преподаватель'
                user_object['private_lessons'] = \
                    True if puser.private_lessons else False
                user_object['group_lessons'] = \
                    True if puser.group_lessons else False
                user_object['level'] = puser.level
                if 'auth.see_moreinfo_teacher' in perms:
                    user_object['note'] = puser.note
            if role == 'Listener':
                user_object['role'] = 'Ученик'
                user_object['private_lessons'] = \
                    True if puser.private_lessons else False
                user_object['group_lessons'] = \
                    True if puser.group_lessons else False
                user_object['level'] = puser.level
                if 'auth.see_moreinfo_listener' in perms:
                    user_object['note'] = puser.note
                    user_object['progress'] = puser.progress
        else:
            raise Http404

        context = {'title': f"Профиль: {puser}",
                   'menu': get_menu(request.user),
                   'puser': user_object,
                   'can_see_data': True,
                   'self': puser == request.user}
        return render(request, self.template_name, context)


class UsersPageTemplateView(CanSeeUserPageMixin, TemplateView):
    template_name = "users/admin_users.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Пользователи',
                   'menu': get_menu(request.user),
                   'perms': dumps({
                       'permissions': list(
                           request.user.get_all_permissions()
                       )
                   })}
        return render(request, self.template_name, context)


class EventJournalTemplateView(CanSeeEventJournalMixin, TemplateView):
    template_name = "events_journal/events_journal_main.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Журнал событий пользователей',
                   'menu': get_menu(request.user)}
        return render(request, self.template_name, context)
