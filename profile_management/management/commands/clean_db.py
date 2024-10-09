from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Group, Permission, User
from django.contrib.contenttypes.models import ContentType
from material.models import Material
from lesson.models import Lesson


class Command(BaseCommand):
    help = 'This command will setup groups and permissions'

    def handle(self, *args, **kwargs):
        try:


            print("Setup complete")
        except Exception as ex:
            raise CommandError(ex)
