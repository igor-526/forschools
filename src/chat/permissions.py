from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q

from profile_management.models import NewUser


class CanSeeAdminChats(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if request.user.groups.filter(name='Admin').exists():
            return super().dispatch(request, *args, **kwargs)
        return self.handle_no_permission()


def can_see_other_users_messages(request):
    return request.user.groups.filter(name__in=["Admin", "Metodist"]).exists()


def can_see_chat(request, user_id: int):
    user_groups = [group.name for group in
                   request.user.groups.filter(name__in=["Admin", "Metodist"])]
    if "Admin" in user_groups:
        return True
    if "Metodist" in user_groups:
        return NewUser.objects.filter(
            Q(plan_listeners__metodist=request.user,
              is_active=True) |
            Q(plan_curator__metodist=request.user,
              is_active=True) |
            Q(plan_teacher__metodist=request.user,
              is_active=True)
        ).filter(id=user_id).exists()
    return False
