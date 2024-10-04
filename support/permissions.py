from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied


class CanSeeSystemLogsMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs) if request.user.is_superuser \
            else PermissionDenied('Permission denied')