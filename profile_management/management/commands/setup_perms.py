from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Group, Permission, User
from django.contrib.contenttypes.models import ContentType


class Command(BaseCommand):
    help = 'My custom startup command'

    def handle(self, *args, **kwargs):
        try:
            Group.objects.get_or_create(name="Admin")
            Group.objects.get_or_create(name="Metodist")
            Group.objects.get_or_create(name="Teacher")
            Group.objects.get_or_create(name="Listener")
            content_type = ContentType.objects.get_for_model(User)
            Permission.objects.get_or_create(codename="register_admin",
                                             name="Регистрация администраторов",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="register_metodist",
                                             name="Регистрация методистов",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="register_teacher",
                                             name="Регистрация преподавателей",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="register_listener",
                                             name="Регистрация учеников",
                                             content_type=content_type)
            print("Setup complete")
        except Exception as ex:
            raise CommandError(ex)
