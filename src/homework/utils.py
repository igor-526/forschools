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
            "name": "Все",
            "statuses": [1, 2, 3, 4, 5, 7],
            "agreement": []
        })
        tabs.append({
            "name": "В работе",
            "statuses": [1, 2, 3, 5, 7],
            "agreement": ["no_need"]
        })
        tabs.append({
            "name": "Ожидает согласования",
            "statuses": [1, 2, 3, 4, 5, 7],
            "agreement": ["not_accepted"]
        })
        tabs.append({
            "name": "Принято",
            "statuses": [4],
            "agreement": ["no_need", "accepted"]
        })
        tabs.append({
            "name": "Отменено",
            "statuses": [6],
            "agreement": []
        })
        settings["show_listener"] = True
        settings["show_teacher"] = True
        settings["show_agreement_filter"] = True
    elif "Metodist" in user_groups:
        tabs.append({
            "name": "Согласовать",
            "statuses": [1, 2, 3, 4, 5, 7],
            "agreement": ["not_accepted"]
        })
        tabs.append({
            "name": "Остальные",
            "statuses": [1, 2, 3, 4, 5, 7],
            "agreement": ["no_need", "accepted"]
        })
        settings["show_listener"] = True
        settings["show_teacher"] = True
        settings["show_agreement_filter"] = True
    elif "Teacher" in user_groups or "Curator" in user_groups:
        tabs.append({
            "name": "Проверить",
            "statuses": [3],
            "agreement": []
        })
        tabs.append({
            "name": "Отправлено",
            "statuses": [1, 2, 5, 7],
            "agreement": []
        })
        tabs.append({
            "name": "Принято",
            "statuses": [4],
            "agreement": []
        })
        settings["show_listener"] = True
    elif "Listener" in user_groups:
        tabs.append({
            "name": "Выполнить",
            "statuses": [2, 5, 7],
            "agreement": []
        })
        tabs.append({
            "name": "Отправлено",
            "statuses": [3],
            "agreement": []
        })
        tabs.append({
            "name": "Принято",
            "statuses": [4],
            "agreement": []
        })
        settings["show_teacher"] = True
    return {"tabs": tabs, "settings": settings}
