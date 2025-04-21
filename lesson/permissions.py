import datetime
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied
from django.utils import timezone
from learning_plan.models import LearningPlan
from lesson.models import Lesson
from profile_management.models import NewUser


class CanReplaceTeacherMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if hw_perm_can_set_replace(request):
            return super().dispatch(request, *args, **kwargs)
        raise PermissionDenied('Permission denied')


class CanEditLessonAdminComment(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if request.user.groups.filter(name='Admin').exists():
            return super().dispatch(request, *args, **kwargs)
        raise PermissionDenied('Permission denied')


class CanSeeLessonMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        usergroups = get_usergroups(request.user)
        if ("Admin" in usergroups) or ("Metodist" in usergroups) or ("Teacher" in usergroups):
            return super().dispatch(request, *args, **kwargs)
        if "Listener" in usergroups:
            lesson = Lesson.objects.get(pk=kwargs.get('pk'))
            if not lesson and lesson.date:
                raise PermissionDenied('Permission denied')
            if request.user in lesson.get_listeners():
                return super().dispatch(request, *args, **kwargs)
        if "Curator" in usergroups:
            lesson = Lesson.objects.get(pk=kwargs.get('pk'))
            learning_plan = lesson.learningphases_set.first().learningplan_set.first()
            if request.user in learning_plan.curators.all():
                return super().dispatch(request, *args, **kwargs)
        raise PermissionDenied('Permission denied')


def get_usergroups(user):
    return [group.name for group in user.groups.all()]


def hw_perm_can_set_replace(request):
    return request.user.groups.filter(name="Admin").exists()


def can_edit_lesson_materials(request, lesson: Lesson):
    if lesson.status == 3:
        return False
    return can_add_homework(request, lesson)


def can_see_lesson_materials(request, lesson: Lesson):
    if request.user.groups.filter(name="Admin").exists():
        return True
    lp = lesson.get_learning_plan()
    if not lp:
        return False
    if (lp.teacher == request.user or lp.metodist == request.user or
            lesson.replace_teacher == request.user or lp.curators.filter(id=request.user.id).exists()):
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
        return timezone.now().timestamp() >= (
                lessondt - datetime.timedelta(days=lp.show_materials)).timestamp()
    return False


def can_add_homework(request, lesson: Lesson):
    usergroups = get_usergroups(request.user)
    if ("Admin" in usergroups) or ("Metodist" in usergroups):
        return True
    if "Teacher" in usergroups:
        return lesson.get_teacher() == request.user
    if "Curator" in usergroups:
        return lesson.get_learning_plan().curators.filter(id=request.user.id).exists()
    return False


def can_set_passed(request, lesson: Lesson):
    if lesson.status != 0 or lesson.date > timezone.now().date():
        return False
    if lesson.get_teacher() == request.user:
        return True
    user_groups = get_usergroups(request.user)
    if "Admin" in user_groups:
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


def can_set_not_held(request, lesson: Lesson):
    if lesson.status == 0:
        return False
    return request.user.groups.filter(name="Admin").exists()
