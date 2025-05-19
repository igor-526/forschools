from django.contrib.auth.mixins import LoginRequiredMixin
from .models import Material


class CanSeeMaterialMixin(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if has_material_access(request, kwargs.get('pk')):
            return super().dispatch(request, *args, **kwargs)
        return self.handle_no_permission()


def has_material_access(request, mat_id):
    usergroups = [group.name for group in request.user.groups.all()]
    if "Admin" in usergroups:
        return True
    try:
        material = Material.objects.get(pk=mat_id)
    except Material.DoesNotExist:
        return False
    if ("Metodist" in usergroups) or ("Teacher" in usergroups):
        if material.visible:
            return True
        return False
    if "Listener" in usergroups:
        if request.user in material.access.all():
            return True
        return material.lesson.filter(
            learningphases__learningplan__listeners=request.user
        ).exists()
