from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Group, Permission, User
from django.contrib.contenttypes.models import ContentType
from material.models import Material


class Command(BaseCommand):
    help = 'My custom startup command'

    def handle(self, *args, **kwargs):
        try:
            gr_admin = Group.objects.get_or_create(name="Admin")[0]
            gr_metodist = Group.objects.get_or_create(name="Metodist")[0]
            gr_teacher = Group.objects.get_or_create(name="Teacher")[0]
            gr_listener = Group.objects.get_or_create(name="Listener")[0]
            content_type = ContentType.objects.get_for_model(User)
            content_type_materials = ContentType.objects.get_for_model(Material)
            register_admin = Permission.objects.get_or_create(codename="register_admin",
                                                              name="Регистрация администраторов",
                                                              content_type=content_type)[0]
            register_metodist = Permission.objects.get_or_create(codename="register_metodist",
                                                                 name="Регистрация методистов",
                                                                 content_type=content_type)[0]
            register_teacher = Permission.objects.get_or_create(codename="register_teacher",
                                                                name="Регистрация преподавателей",
                                                                content_type=content_type)[0]
            register_listener = Permission.objects.get_or_create(codename="register_listener",
                                                                 name="Регистрация учеников",
                                                                 content_type=content_type)[0]
            register_users = Permission.objects.get_or_create(codename="register_users",
                                                              name="Регистрация пользователей",
                                                              content_type=content_type)[0]
            edit_admin = Permission.objects.get_or_create(codename="edit_admin",
                                                          name="Изменение информации администратора",
                                                          content_type=content_type)[0]
            edit_metodist = Permission.objects.get_or_create(codename="edit_metodist",
                                                             name="Изменение информации методиста",
                                                             content_type=content_type)[0]
            edit_teacher = Permission.objects.get_or_create(codename="edit_teacher",
                                                            name="Изменение информации преподавателя",
                                                            content_type=content_type)[0]
            edit_listener = Permission.objects.get_or_create(codename="edit_listener",
                                                             name="Изменение информации ученика",
                                                             content_type=content_type)[0]
            deactivate_admin = Permission.objects.get_or_create(codename="deactivate_admin",
                                                                name="Деактивация администратора",
                                                                content_type=content_type)[0]
            deactivate_metodist = Permission.objects.get_or_create(codename="deactivate_metodist",
                                                                   name="Деактивация методиста",
                                                                   content_type=content_type)[0]
            deactivate_teacher = Permission.objects.get_or_create(codename="deactivate_teacher",
                                                                  name="Деактивация преподавателя",
                                                                  content_type=content_type)[0]
            deactivate_listener = Permission.objects.get_or_create(codename="deactivate_listener",
                                                                   name="Деактивация ученика",
                                                                   content_type=content_type)[0]
            see_moreinfo_admin = Permission.objects.get_or_create(codename="see_moreinfo_admin",
                                                                  name="Доп. информация администратора",
                                                                  content_type=content_type)[0]
            see_moreinfo_metodist = Permission.objects.get_or_create(codename="see_moreinfo_metodist",
                                                                     name="Доп. информация методиста",
                                                                     content_type=content_type)[0]
            see_moreinfo_teacher = Permission.objects.get_or_create(codename="see_moreinfo_teacher",
                                                                    name="Доп. информация преподавателя",
                                                                    content_type=content_type)[0]
            see_moreinfo_listener = Permission.objects.get_or_create(codename="see_moreinfo_listener",
                                                                     name="Доп. информация ученика",
                                                                     content_type=content_type)[0]

            add_general = Permission.objects.get_or_create(codename="add_general",
                                                           name="Добавление общего материала",
                                                           content_type=content_type_materials[0])
            add_personal = Permission.objects.get_or_create(codename="add_personal",
                                                            name="Добавление личного материала",
                                                            content_type=content_type_materials[0])
            add_new_cat = Permission.objects.get_or_create(codename="add_new_cat",
                                                           name="Добавление новой категории материалов",
                                                           content_type=content_type_materials[0])
            see_all_general = Permission.objects.get_or_create(codename="see_all_general",
                                                               name="Просмотр общих материалов",
                                                               content_type=content_type_materials[0])
            send_to_moderate = Permission.objects.get_or_create(codename="send_to_moderate",
                                                                name="Отправка материалов на модерацию",
                                                                content_type=content_type_materials[0])
            moderate = Permission.objects.get_or_create(codename="moderate",
                                                        name="Модерация материалов",
                                                        content_type=content_type_materials[0])
            see_all_general = Permission.objects.get_or_create(codename="see_all_general",
                                                               name="Просмотр оьщих материалов",
                                                               content_type=content_type_materials[0])
            see_not_own = Permission.objects.get_or_create(codename="see_not_own",
                                                           name="Просмотр чужих личных материалов",
                                                           content_type=content_type_materials[0])
            send_telegram = Permission.objects.get_or_create(codename="send_telegram",
                                                             name="Отправка материалов в Telegram ученикам",
                                                             content_type=content_type_materials[0])

            admin_perms = (register_users,
                           register_admin,
                           register_metodist,
                           register_teacher,
                           register_listener,
                           edit_admin,
                           edit_metodist,
                           edit_teacher,
                           edit_listener,
                           deactivate_admin,
                           deactivate_metodist,
                           deactivate_teacher,
                           deactivate_listener,
                           see_moreinfo_admin,
                           see_moreinfo_metodist,
                           see_moreinfo_teacher,
                           see_moreinfo_listener,)

            metodist_perms = (register_users,
                              register_teacher,
                              register_listener,
                              edit_teacher,
                              edit_listener,
                              deactivate_listener,
                              see_moreinfo_teacher,
                              see_moreinfo_listener,)

            teacher_perms = (edit_listener,
                             see_moreinfo_listener,)

            gr_admin.permissions.set(admin_perms)
            gr_metodist.permissions.set(metodist_perms)
            gr_teacher.permissions.set(teacher_perms)

            print("Setup complete")
        except Exception as ex:
            raise CommandError(ex)
