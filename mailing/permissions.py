from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied


class MailingAccessMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if mailing_permission(request.user):
            return super().dispatch(request, *args, **kwargs)
        raise PermissionDenied('Permission denied')


def mailing_permission(user):
    return user.user_permissions.filter(codename="mailing_access").exists()
