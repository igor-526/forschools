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
    except Exception as e:
        return None
