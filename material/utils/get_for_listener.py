from material.models import Material


def get_materials_for_listener(listener_id):
    return Material.objects.filter(lesson_set__status=1,
                                   lesson_set__learningphases__learningplan__listeners=listener_id)


async def aget_materials_for_listener(listener_id, page):
    return [material async for material
            in Material.objects.filter(
                lesson_set__status=1,
                lesson_set__learningphases__learningplan__listeners=listener_id
            ).exclude(category__name="ДЗ")[(page - 1) * 9:page * 9]]


async def aget_materials_for_listener_next(listener_id, page):
    return len([material async for material
                in Material.objects.filter(
                    lesson_set__status=1,
                    lesson_set__learningphases__learningplan__listeners=listener_id
                ).exclude(category__name="ДЗ")[page * 9:(page + 1) * 9]]) > 0
