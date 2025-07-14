from profile_management.models import NewUser


async def get_user(tg_id) -> NewUser or None:
    return await NewUser.objects.filter(telegram__tg_id=tg_id).afirst()
