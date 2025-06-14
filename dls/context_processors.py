from dls.utils import get_menu
from dls.settings import MATERIAL_FORMATS


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
    return {"menu": get_menu(request.user)}


def get_supported_extensions_context(request) -> dict:
    supported_extensions = []
    for media_type in MATERIAL_FORMATS:
        supported_extensions.extend(MATERIAL_FORMATS[media_type])
    return {"supported_extensions": MATERIAL_FORMATS}
