from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied


class CanSeeUserPageMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        usergroups = [group.name for group in request.user.groups.all()]
        if ("Admin" in usergroups) or ("Metodist" in usergroups) or ("Teacher" in usergroups):
            return super().dispatch(request, *args, **kwargs)
        raise PermissionDenied('Permission denied')


class CanSeeEventJournalMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if request.user.groups.filter(name="Admin").exists():
            return super().dispatch(request, *args, **kwargs)
        raise PermissionDenied('Permission denied')


def get_editable_perm(user, obj) -> bool:
    usergroups = [group.name for group in user.groups.all()]
    if "Admin" in usergroups:
        return True
    objgroups = [group.name for group in obj.groups.all()]
    if "Metodist" in usergroups:
        if ("Admin" in objgroups) or ("Metodist" in objgroups):
            return False
        if ("Teacher" in objgroups) or ("Listener" in objgroups):
            return True
    if "Teacher" in usergroups:
        if ("Admin" in objgroups) or ("Metodist" in objgroups) or ("Teacher" in objgroups):
            return False
        if "Listener" in objgroups:
            return True
    return False


def get_secretinfo_perm(user, obj) -> bool:
    objgroups = [group.name for group in obj.groups.all()]
    if user.is_superuser:
        return True
    if "Admin" in objgroups and user.has_perm("auth.deactivate_admin"):
        return True
    if "Metodist" in objgroups and user.has_perm("auth.deactivate_metodist"):
        return True
    if "Teacher" in objgroups and user.has_perm("auth.deactivate_teacher"):
        return True
    if "Listener" in objgroups and user.has_perm("auth.deactivate_listener"):
        return True
    return False


def get_can_add_new_engch_lvl_prg_perm(user) -> bool:
    usergroups = [group.name for group in user.groups.all()]
    if ("Admin" in usergroups) or ("Metodist" in usergroups):
        return True
    return False
