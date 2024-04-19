from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied


class CanReplaceTeacherMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if replace_teacher_button(request):
            return super().dispatch(request, *args, **kwargs)
        raise PermissionDenied('Permission denied')


def replace_teacher_button(request):
    usergroups = [group.name for group in request.user.groups.all()]
    return ("Admin" in usergroups) or ("Metodist" in usergroups)