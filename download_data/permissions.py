from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied


class CanSeeGeneratedData(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if request.user.groups.filter(name='Admin').exists():
            return super().dispatch(request, *args, **kwargs)
        raise PermissionDenied('Permission denied')
