from django.contrib.auth.mixins import LoginRequiredMixin


class MailingAccessMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if mailing_permission(request.user):
            return super().dispatch(request, *args, **kwargs)
        return self.handle_no_permission()


def mailing_permission(user):
    return user.user_permissions.filter(codename="mailing_access").exists()
