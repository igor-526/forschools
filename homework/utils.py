statuses = {
    1: 'Создано',
    2: 'Открыто',
    3: 'На проверке',
    4: 'Принято',
    5: 'На доработке',
    6: 'Отменено',
    7: 'Задано'
}


def status_code_to_string(status_code):
    try:
        st = int(status_code)
        return statuses.get(st)
    except Exception:
        return None


def get_homework_list_settings(user_groups):
    tabs = []
    settings = {
        "show_listener": False,
        "show_teacher": False,
        "show_agreement_filter": False
    }
    if "Admin" in user_groups:
        tabs.append({
            "name": "В работе",
            "statuses": [1, 2, 3, 5, 7],
        })
        tabs.append({
            "name": "Принято",
            "statuses": [4],
        })
        tabs.append({
            "name": "Отменено",
            "statuses": [6],
        })
        settings["show_listener"] = True
        settings["show_teacher"] = True
        settings["show_agreement_filter"] = True
    elif "Metodist" in user_groups:
        tabs.append({
            "name": "Согласовать",
            "statuses": [4, 5, 7],
            "need_agreement": True
        })
        tabs.append({
            "name": "Остальные",
            "statuses": [1, 2, 3],
            "need_agreement": False
        })
        settings["show_listener"] = True
        settings["show_teacher"] = True
        settings["show_agreement_filter"] = True
    elif "Teacher" in user_groups or "Curator" in user_groups:
        tabs.append({
            "name": "Проверить",
            "statuses": [3]
        })
        tabs.append({
            "name": "Отправлено",
            "statuses": [1, 2, 5, 7]
        })
        tabs.append({
            "name": "Принято",
            "statuses": [4]
        })
        settings["show_listener"] = True
    elif "Listener" in user_groups:
        tabs.append({
            "name": "Выполнить",
            "statuses": [2, 5, 7]
        })
        tabs.append({
            "name": "Отправлено",
            "statuses": [3]
        })
        tabs.append({
            "name": "Принято",
            "statuses": [4]
        })
        settings["show_teacher"] = True
    return {"tabs": tabs, "settings": settings}
