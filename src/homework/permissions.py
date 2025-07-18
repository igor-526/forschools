from django.contrib.auth.mixins import LoginRequiredMixin

from .models import Homework, HomeworkLog


class CanEditHomeworkAdminComment(LoginRequiredMixin):
    def dispatch(self, request, *args, **kwargs):
        if request.user.groups.filter(name='Admin').exists():
            return super().dispatch(request, *args, **kwargs)
        return self.handle_no_permission()


def get_delete_log_permission(log: HomeworkLog, request):
    user_groups = request.user.get_groups()
    all_logs = [{
        "log_id": log_note.id,
        "log_status": log_note.status
    } for log_note in (HomeworkLog.objects.filter(homework=log.homework)
                       .order_by('-dt'))]
    deletable_logs = []
    for log_note in all_logs:
        if not deletable_logs:
            deletable_logs.append(log_note)
        else:
            if log_note["log_status"] == deletable_logs[-1]["log_status"]:
                deletable_logs.append(log_note)
            else:
                break
    deletable_logs = [log["log_id"] for log in deletable_logs]
    if ("Admin" in user_groups or
            "Metodist" in user_groups or
            request.user == log.user and
            "Listener" not in user_groups):
        if log.status in [1, 2, 3]:
            return False
        if log.homework.get_status().status in [1, 2]:
            return False
        return log.id in deletable_logs
    if "Listener" in user_groups and request.user == log.user:
        print("FFF")
        if log.status != 3:
            return False
        if log.homework.get_status().status != 3:
            return False
        return log.id in deletable_logs
    return False


def get_send_hw_permission(hw: Homework, request):
    return ((hw.get_status().status in [1, 2, 3, 5, 7]) and
            hw.listener == request.user)


def get_can_check_hw_permission(hw: Homework, request):
    hw_status = hw.get_status().status in [3, 5, 7]
    if not hw_status:
        return False
    lesson = hw.get_lesson()
    lp = lesson.get_learning_plan() if lesson else None
    return (hw.teacher == request.user or
            request.user.groups.filter(name__in=["Admin"]).exists() or
            (lp and lp.metodist == request.user) or
            (lp and lp.curators.filter(id=request.user.id).exists()))


def get_can_cancel_hw_permission(hw: Homework, request):
    hw_status = hw.get_status().status in [1, 2, 3, 5, 7]
    if not hw_status:
        return False
    lesson = hw.get_lesson()
    lp = lesson.get_learning_plan() if lesson else None
    return (hw.teacher == request.user or
            (lp and lp.metodist == request.user) or
            request.user.groups.filter(name__in=["Admin"]).exists())


def get_can_accept_log_permission(hw: Homework, request):
    if request.user.groups.filter(name="Admin").exists():
        return True
    lesson = hw.get_lesson()
    lp = lesson.get_learning_plan() if lesson else None
    return lp and lp.metodist == request.user


def get_can_edit_hw_permission(hw: Homework, request):
    if hw.teacher == request.user:
        return True
    if request.user.groups.filter(name="Admin").exists():
        return True
    lesson = hw.get_lesson()
    if lesson:
        plan = lesson.get_learning_plan()
        if (plan.metodist == request.user or
                (plan.curators.filter(id=request.user.id).exists() and
                 hw.for_curator)):
            return True
    return request.user.groups.filter(name="Admin").exists()
