from django.contrib.auth.mixins import LoginRequiredMixin


class CanSeeGeneratedData(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if request.user.groups.filter(name='Admin').exists():
            return super().dispatch(request, *args, **kwargs)
        return self.handle_no_permission()
