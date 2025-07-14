from django.contrib.auth.mixins import LoginRequiredMixin

from learning_plan.models import LearningPlan

from lesson.models import Lesson


class CanSeePlansPageMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if request.user.groups.filter(name__in=['Admin', 'Metodist']):
            return super().dispatch(request, *args, **kwargs)
        return self.handle_no_permission()


class CanDownloadPlan(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if can_download_plan(request):
            return super().dispatch(request, *args, **kwargs)
        return self.handle_no_permission()


class CanEditPlanItemAdminComment(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if request.user.groups.filter(name='Admin').exists():
            return super().dispatch(request, *args, **kwargs)
        return self.handle_no_permission()


def can_edit_plan(request, plan=None, phase=None):
    usergroups = [group.name for group in request.user.groups.all()]
    if ("Admin" in usergroups) or ("Metodist" in usergroups):
        return True
    if "Teacher" in usergroups:
        if plan:
            return request.user == plan.teacher
        if phase:
            return phase.learningplan_set.first().teacher == request.user
    return False


def can_generate_from_program(request, plan):
    if plan.phases.count() > 0:
        return False
    return can_edit_plan(request, plan)


def get_can_see_plan(request, plan: LearningPlan, lesson: Lesson = None):
    return (request.user.groups.filter(name="Admin").exists() or
            plan.metodist == request.user or plan.teacher == request.user or
            plan.curators.filter(pk=request.user.pk).exists() or
            (lesson and lesson.replace_teacher == request.user))


def can_download_plan(request):
    return request.user.groups.filter(name="Admin").exists()


def get_can_edit_pre_hw_comment(request, plan: LearningPlan):
    if request.user.groups.filter(name="Admin").exists():
        return True
    return plan.metodist == request.user
