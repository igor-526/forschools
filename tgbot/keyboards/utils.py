import os
from random import randint
from dls.settings import DEBUG, ALLOWED_HOSTS
from profile_management.models import Telegram


def keyboard_anti_cache_url(path: str = "/"):
    url = f'https://development.kitaischool.ru' if DEBUG else f'https://{os.environ.get("DJANGO_ALLOWED_HOST")}'
    url += path
    n = randint(10000, 99999)
    return f'{url}?ac={n}'


async def get_web_url(tg_id: int = None, tg_note: Telegram = None,
                      path: str = None, params: list = None,
                      url_hash: list = None) -> str:
    if params is None:
        params = []
    if url_hash is None:
        url_hash = []
    if tg_note is None and tg_id:
        tg_note = await Telegram.objects.select_related("user").aget(tg_id=tg_id)
    if tg_note.access_token:
        params.append(f'token={tg_note.access_token}')
    if path:
        params.append(f'next=/{path}/')
    for h in url_hash:
        params.append(f"nextHash={h}")
    if DEBUG:
        base_url = "kitai-school.forschools.ru"
    else:
        base_url = ALLOWED_HOSTS[0]
    url = f'https://{base_url}/login_tg/'
    url += "?" + "&".join(params)
    return url

