from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied


class CanSeePlansPageMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if plans_button(request):
            return super().dispatch(request, *args, **kwargs)
        raise PermissionDenied('Permission denied')


def plans_button(request):
    usergroups = [group.name for group in request.user.groups.all()]
    return ("Admin" in usergroups) or ("Metodist" in usergroups) or ("Teacher" in usergroups)


def can_edit_plan(request, plan=None, phase=None):
    usergroups = [group.name for group in request.user.groups.all()]
    if ("Admin" in usergroups) or ("Metodist" in usergroups):
        return True
    if "Teacher" in usergroups:
        if plan:
            return request.user == plan.teacher
        if phase:
            return phase.learningplan_set.first().teacher == request.user


def can_generate_from_program(request, plan):
    if plan.phases.count() > 0:
        return False
    else:
        return can_edit_plan(request, plan)
