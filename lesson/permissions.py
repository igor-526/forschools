import datetime
from typing import List

from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils import timezone

from learning_plan.models import LearningPlan
from lesson.models import Lesson
from profile_management.models import NewUser


class CanReplaceTeacherMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if request.user.groups.filter(name="Admin").exists():
            return super().dispatch(request, *args, **kwargs)
        return self.handle_no_permission()


class CanSetNotHeldMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if request.user.groups.filter(name="Admin").exists():
            return super().dispatch(request, *args, **kwargs)
        return self.handle_no_permission()


class CanEditLessonAdminComment(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if request.user.groups.filter(name='Admin').exists():
            return super().dispatch(request, *args, **kwargs)
        return self.handle_no_permission()


class CanSeeLessonMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        usergroups = get_usergroups(request.user)
        if (("Admin" in usergroups) or
                ("Metodist" in usergroups) or
                ("Teacher" in usergroups)):
            return super().dispatch(request, *args, **kwargs)
        if "Listener" in usergroups:
            lesson = Lesson.objects.get(pk=kwargs.get('pk'))
            if not lesson and lesson.date:
                return self.handle_no_permission()
            if request.user in lesson.get_listeners():
                return super().dispatch(request, *args, **kwargs)
        if "Curator" in usergroups:
            lesson = Lesson.objects.get(pk=kwargs.get('pk'))
            learning_plan = (lesson.learningphases_set.first()
                             .learningplan_set.first())
            if request.user in learning_plan.curators.all():
                return super().dispatch(request, *args, **kwargs)
        return self.handle_no_permission()


def get_usergroups(user):
    return [group.name for group in user.groups.all()]


def lesson_perm_can_set_replace(lesson=Lesson,
                                is_admin: bool = None,
                                user_groups=None) -> bool:
    if lesson.status != 0:
        return False
    if is_admin is not None:
        return is_admin
    if user_groups is None:
        user_groups = []
    return "Admin" in user_groups


def can_edit_lesson_materials(request, lesson: Lesson):
    if lesson.status == 3:
        return False
    return lesson_perm_can_add_homework(user=request.user, lesson=lesson)


def can_see_lesson_materials(request, lesson: Lesson):
    if request.user.groups.filter(name="Admin").exists():
        return True
    lp = lesson.get_learning_plan()
    if not lp:
        return False
    if (lp.teacher == request.user or lp.metodist == request.user or
            lesson.replace_teacher == request.user or
            lp.curators.filter(id=request.user.id).exists()):
        return True
    if lp.listeners.filter(id=request.user.id).exists():
        if not lesson.date:
            return False
        lessondt = timezone.datetime(lesson.date.year, lesson.date.month, lesson.date.day)
        if not lp.show_materials:
            if lesson.status == 1:
                return True
            else:
                return lesson.materials_access
        return (timezone.now().timestamp() >= (
                lessondt - datetime.timedelta(days=lp.show_materials))
                .timestamp())
    return False


def lesson_perm_can_add_homework(user: NewUser,
                                 lesson: Lesson,
                                 plan: LearningPlan = None,
                                 user_groups=None) -> bool:
    if user_groups is None:
        user_groups = user.groups.values_list("name", flat=True)
    if ("Admin" in user_groups) or ("Metodist" in user_groups):
        return True
    if "Teacher" in user_groups:
        return lesson.get_teacher() == user
    if "Curator" in user_groups:
        if plan is None:
            plan = lesson.get_learning_plan()
        return plan.curators.filter(
            id=user.id
        ).exists()
    return False


def can_set_passed(request, lesson: Lesson):
    if lesson.status != 0 or lesson.date > timezone.now().date():
        return False
    if lesson.get_teacher() == request.user and lesson.homeworks.count():
        return True
    if request.user.groups.filter(name="Admin").exists():
        return True
    if lesson.get_learning_plan().metodist == request.user:
        return True
    return False


async def a_can_set_passed_perm(user: NewUser, lesson: Lesson):
    if lesson.status != 0 or lesson.date > timezone.now().date():
        return False
    if await lesson.aget_teacher() == user:
        return True
    return False


def lesson_perm_can_set_not_held(lesson: Lesson = None,
                                 is_admin: bool = None,
                                 user_groups=None) -> bool:
    if lesson is None or lesson.status == 0:
        return False
    if is_admin is not None:
        return is_admin
    if user_groups is None:
        user_groups = []
    return "Admin" in user_groups


def lesson_perm_can_edit(lesson: Lesson = None,
                         is_admin: bool = None,
                         user_groups=None) -> bool:
    if lesson is None or lesson.status == 2:
        return False
    if is_admin is not None:
        return is_admin
    if user_groups is None:
        user_groups = []
    return "Admin" in user_groups


def lesson_perm_can_delete(lesson: Lesson = None,
                           is_admin: bool = None,
                           user_groups=None) -> bool:
    if lesson is None or lesson.status in [1, 2]:
        return False
    if is_admin is not None:
        return is_admin
    if user_groups is None:
        user_groups = []
    return "Admin" in user_groups
