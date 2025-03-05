from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Group, Permission, User
from django.contrib.contenttypes.models import ContentType
from material.models import Material
from lesson.models import Lesson


class Command(BaseCommand):
    help = 'This command will setup groups and permissions'
    admin_perms = []
    metodist_perms = []
    teacher_perms = []
    listener_perms = []
    curator_perms = []

    def add_auth_perms(self):
        content_type = ContentType.objects.get_for_model(User)
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
        register_curator = Permission.objects.get_or_create(codename="register_curator",
                                                            name="Регистрация кураторов",
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
        edit_curator = Permission.objects.get_or_create(codename="edit_curator",
                                                        name="Изменение информации куратора",
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
        can_read_all_messages = Permission.objects.get_or_create(codename="can_read_all_messages",
                                                                 name="Чтение сообщений от имени других пользователей",
                                                                 content_type=content_type)[0]
        can_login = Permission.objects.get_or_create(codename="can_login",
                                                     name="Залогинивание под другими пользователями",
                                                     content_type=content_type)[0]
        self.admin_perms += (register_users, register_admin,
                             register_metodist, register_teacher,
                             register_listener, edit_admin,
                             edit_metodist, edit_teacher,
                             edit_listener, edit_curator,
                             deactivate_metodist, deactivate_teacher,
                             deactivate_listener, see_moreinfo_admin,
                             see_moreinfo_metodist, see_moreinfo_teacher,
                             see_moreinfo_listener, register_curator
                             )

        self.metodist_perms += (register_users, register_teacher,
                                register_listener, edit_teacher,
                                edit_listener,  deactivate_listener,
                                see_moreinfo_teacher, see_moreinfo_listener,
                                )

        self.teacher_perms += (edit_listener, see_moreinfo_listener,
                               )

    def add_material_perms(self):
        content_type_materials = ContentType.objects.get_for_model(Material)
        add_general = Permission.objects.get_or_create(codename="add_general",
                                                       name="Добавление общего материала",
                                                       content_type=content_type_materials)[0]
        add_personal = Permission.objects.get_or_create(codename="add_personal",
                                                        name="Добавление личного материала",
                                                        content_type=content_type_materials)[0]
        add_new_cat = Permission.objects.get_or_create(codename="add_new_cat",
                                                       name="Добавление новой категории материалов",
                                                       content_type=content_type_materials)[0]
        send_to_moderate = Permission.objects.get_or_create(codename="send_to_moderate",
                                                            name="Отправка материалов на модерацию",
                                                            content_type=content_type_materials)[0]
        moderate = Permission.objects.get_or_create(codename="moderate",
                                                    name="Модерация материалов",
                                                    content_type=content_type_materials)[0]
        see_all_general = Permission.objects.get_or_create(codename="see_all_general",
                                                           name="Просмотр общих материалов",
                                                           content_type=content_type_materials)[0]
        see_not_own = Permission.objects.get_or_create(codename="see_not_own",
                                                       name="Просмотр чужих личных материалов",
                                                       content_type=content_type_materials)[0]
        see_listener_mat = Permission.objects.get_or_create(codename="see_listener_mat",
                                                            name="Просмотр материалов ученика",
                                                            content_type=content_type_materials)[0]
        send_telegram = Permission.objects.get_or_create(codename="send_telegram",
                                                         name="Отправка материалов в Telegram ученикам",
                                                         content_type=content_type_materials)[0]

        self.admin_perms += (add_general, add_personal,
                             add_new_cat, see_all_general,
                             see_not_own, moderate,
                             send_telegram, see_listener_mat,
                             )

        self.metodist_perms += (add_general, add_personal,
                                add_new_cat, see_all_general,
                                see_not_own, moderate,
                                send_telegram, see_listener_mat,
                                )

        self.teacher_perms += (add_personal,
                               see_all_general,
                               send_to_moderate,
                               send_telegram,
                               see_listener_mat,
                               )

        self.listener_perms += (see_listener_mat,
                                )

    def add_lesson_perms(self):
        content_type = ContentType.objects.get_for_model(Lesson)
        edit_plans_self = Permission.objects.get_or_create(codename="edit_plans_self",
                                                           name="Создание/редактирование своих планов обучения",
                                                           content_type=content_type)[0]
        edit_plans_all = Permission.objects.get_or_create(codename="edit_plans_all",
                                                          name="Создание/редактирование чужих планов обучения",
                                                          content_type=content_type)[0]
        see_plans_self = Permission.objects.get_or_create(codename="see_plans_self",
                                                          name="Просмотр своих планов обучения",
                                                          content_type=content_type)[0]
        see_plans_all = Permission.objects.get_or_create(codename="see_plans_all",
                                                         name="Просмотр всех планов обучения",
                                                         content_type=content_type)[0]
        comment_lesson = Permission.objects.get_or_create(codename="comment_lesson",
                                                          name="Комментирование/оценка занятия",
                                                          content_type=content_type)[0]
        see_teachers_comment = Permission.objects.get_or_create(codename="see_teachers_comment",
                                                                name="Просмотр комментария преподавателя",
                                                                content_type=content_type)[0]

        self.admin_perms += (
            edit_plans_all, see_teachers_comment,
            see_plans_all, edit_plans_self
        )

        self.metodist_perms += (
            edit_plans_all, see_teachers_comment,
            see_plans_all, edit_plans_self
        )

        self.teacher_perms += (
            edit_plans_self, see_teachers_comment,
            see_plans_all,
        )

        self.listener_perms += (
            see_plans_self, comment_lesson
        )

    def handle(self, *args, **kwargs):
        try:
            gr_admin = Group.objects.get_or_create(name="Admin")[0]
            gr_metodist = Group.objects.get_or_create(name="Metodist")[0]
            gr_teacher = Group.objects.get_or_create(name="Teacher")[0]
            gr_listener = Group.objects.get_or_create(name="Listener")[0]
            gr_curator = Group.objects.get_or_create(name="Curator")[0]

            self.add_auth_perms()
            self.add_material_perms()
            self.add_lesson_perms()

            gr_admin.permissions.set(self.admin_perms)
            gr_metodist.permissions.set(self.metodist_perms)
            gr_teacher.permissions.set(self.teacher_perms)
            gr_listener.permissions.set(self.listener_perms)
            gr_curator.permissions.set(self.curator_perms)

            print("Setup complete")
        except Exception as ex:
            raise CommandError(ex)
