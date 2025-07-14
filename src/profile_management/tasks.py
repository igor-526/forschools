from pprint import pprint

from homework.models import Homework


def get_teachers_and_methodists_data_info():
    s_c = 0
    unchecked_homeworks = Homework.objects.filter(
        log_set__status=3
    ).exclude(log_set__status__in=[4, 6]).values(
        "id",
        "teacher__first_name",
        "teacher__last_name",
        "teacher__id",
        "name",
        "lesson__date",
        "listener__first_name",
        "listener__last_name",
    )
    users_result = {}
    for hw in unchecked_homeworks:
        if hw["teacher__id"] not in users_result:
            users_result[hw["teacher__id"]] = {
                "name": f"{hw['teacher__first_name']} "
                        f"{hw['teacher__last_name']}",
                "role": "Teacher",
                "unchecked_homeworks": []
            }
        s_c += len(f"{hw['name']} ({hw['listener__first_name']} "
                   f"{hw['listener__last_name']}) от "
                   f"{hw['lesson__date'].strftime('%d.%m')}")
        users_result[hw["teacher__id"]]['unchecked_homeworks'].append(
            f"{hw['name']} ({hw['listener__first_name']} "
            f"{hw['listener__last_name']}) от "
            f"{hw['lesson__date'].strftime('%d.%m')}"
        )
    pprint(users_result)
