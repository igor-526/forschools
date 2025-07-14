from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied


class CanSeeSystemLogsMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs) \
            if request.user.groups.filter(name="Admin").exists() \
            else PermissionDenied('Permission denied')


class CanChangeSystemLogsMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)\
            if get_perm_can_change_system_logs(request) \
            else PermissionDenied('Permission denied')


def get_perm_can_change_system_logs(request):
    return request.user.is_superuser
