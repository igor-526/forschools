from dls.utils import get_menu


def get_roles_context(request) -> dict:
    if not request.user.is_authenticated:
        return {}
    user_groups = request.user.groups.all().values_list("name", flat=True)
    return {
        "is_admin": "Admin" in user_groups,
        "is_methodist": "Metodist" in user_groups,
        "is_teacher": "Teacher" in user_groups,
        "is_curator": "Curator" in user_groups,
        "is_listener": "Listener" in user_groups,
    }


def get_telegram_context(request) -> dict:
    if not request.user.is_authenticated:
        return {}
    tg_id = request.user.telegram.filter(usertype="main").values_list("tg_id").first()
    return {"tg_id": tg_id[0] if tg_id else None}


def get_menu_context(request) -> dict:
    if not request.user.is_authenticated:
        return {}
    return ({} if request.user_agent.is_mobile
            else {"menu": get_menu(request.user)})
