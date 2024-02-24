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
            Permission.objects.get_or_create(codename="edit_listener",
                                             name="Редактирование профиля ученика",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="edit_teacher",
                                             name="Редактирование профиля преподавателя",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="edit_metodist",
                                             name="Редактирование профиля методиста",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="see_work_experience",
                                             name="Просмотр опыта работы",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="see_programs_teacher",
                                             name="Просмотр программ обучения преподавателей",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="see_programs_listener",
                                             name="Просмотр программ обучения учеников",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="see_listener_category",
                                             name="Просмотр категории учеников",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="see_private_or_group_lessons",
                                             name="Просмотр типа занятий",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="see_note_metodist",
                                             name="Просмотр примечания методиста",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="see_note_teacher",
                                             name="Просмотр примечания преподавателя",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="see_note_listener",
                                             name="Просмотр примечания ученика",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="see_level_teacher",
                                             name="Просмотр уровня преподавателя",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="see_level_student",
                                             name="Просмотр уровня ученика",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="see_progress",
                                             name="Просмотр прогресса ученика",
                                             content_type=content_type)
            Permission.objects.get_or_create(codename="see_engagement_channel",
                                             name="Просмотр канала привлечения",
                                             content_type=content_type)
            print("Setup complete")
        except Exception as ex:
            raise CommandError(ex)
