from tgbot.create_bot import bot
from profile_management.models import NewUser, Telegram
import asyncio


def get_tg_id(user: NewUser) -> int | None:
    tg = Telegram.objects.filter(user=user).first()
    if tg:
        return tg.tg_id
    else:
        return None
