import datetime
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied
from django.utils import timezone
from learning_plan.models import LearningPlan
from lesson.models import Lesson


class CanReplaceTeacherMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if hw_perm_can_set_replace(request):
            return super().dispatch(request, *args, **kwargs)
        raise PermissionDenied('Permission denied')


class CanSeeLessonMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        usergroups = get_usergroups(request.user)
        if ("Admin" in usergroups) or ("Metodist" in usergroups) or ("Teacher" in usergroups):
            return super().dispatch(request, *args, **kwargs)
        if "Listener" in usergroups:
            lesson = Lesson.objects.get(pk=kwargs.get('pk'))
            if not lesson.date:
                raise PermissionDenied('Permission denied')
            learning_plan = lesson.learningphases_set.first().learningplan_set.first()
            lessondt = timezone.datetime(lesson.date.year, lesson.date.month, lesson.date.day)
            if ((learning_plan.listeners.filter(id=request.user.id).exists()) and
                    (timezone.now().timestamp() >= (
                            lessondt - timezone.timedelta(days=learning_plan.show_lessons)).timestamp())):
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
    if LearningPlan.listeners.filter(id=request.user.id).exists():
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
    if lesson.status == 0:
        if not request.user.groups.filter(name="Listener").exists():
            if (request.user.groups.filter(name__in=["Metodist", "Admin"]).exists() or
                    lesson.get_teacher() == request.user):
                lesson_end = lesson.date
                if lesson.end_time:
                    lesson_end = datetime.datetime(
                        year=lesson.date.year,
                        month=lesson.date.month,
                        day=lesson.date.day,
                        hour=lesson.end_time.hour,
                        minute=lesson.end_time.minute,
                        second=0,
                        microsecond=0)
                    return lesson_end < datetime.datetime.now()
                else:
                    return lesson_end < datetime.date.today()
    return False


def can_set_not_held(request, lesson: Lesson):
    if lesson.status == 0:
        return False
    return request.user.groups.filter(name="Admin").exists()
