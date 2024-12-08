from .models import HomeworkLog, Homework


def get_delete_log_permission(log: HomeworkLog, request):
    if request.user.groups.filter(name__in=['Admin', 'Metodist']).exists() or request.user == log.user:
        if log.status in [1, 2, 3, 7]:
            return False
        if log.homework.get_status().status in [1, 2, 7]:
            return False
        all_logs = [{
            "log_id": log_note.id,
            "log_status": log_note.status
        } for log_note in HomeworkLog.objects.filter(homework=log.homework).order_by('-dt')]
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
        return log.id in deletable_logs
    else:
        return False


def get_send_hw_permission(hw: Homework, request):
    return (hw.get_status().status in [1, 2, 3, 5, 7]) and hw.listener == request.user


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
            request.user.groups.filter(name__in=["Admin"]).exists() or
            (lp and lp.metodist == request.user))


def get_can_accept_log_permission(hw: Homework, request):
    lesson = hw.get_lesson()
    lp = lesson.get_learning_plan() if lesson else None
    return (request.user.groups.filter(name="Admin").exists() or
            (lp and lp.metodist == request.user))
