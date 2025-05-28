import os
from random import randint
from typing import List

from dls.settings import DEBUG, ALLOWED_HOSTS
from profile_management.models import Telegram


def keyboard_anti_cache_url(path: str = "/"):
    url = f'https://development.kitaischool.ru' if DEBUG else f'https://{os.environ.get("DJANGO_ALLOWED_HOST")}'
    url += path
    n = randint(10000, 99999)
    return f'{url}?ac={n}'


class WebPlatformUrl:
    url = ""
    params: List[str]
    url_hash: List[str]

    def __init__(self, path: str = None, params: list = None,
                 url_hash: list = None) -> None:
        if DEBUG:
            self.url = "kitai-school.forschools.ru"
        else:
            self.url = ALLOWED_HOSTS[0]
        self.url = f'https://{self.url}/login_tg/'
        if params is None:
            self.params = []
        if url_hash is None:
            self.url_hash = []
        if path:
            self.params.append(f'next=/{path}/')
        for h in self.url_hash:
            self.params.append(f"nextHash={h}")

    def set_token_by_tg_note(self, tg_note: Telegram) -> None:
        self.params.append(f'token={tg_note.access_token}')

    async def set_token_by_tg_id(self, tg_id: int) -> None:
        tg_note = await Telegram.objects.aget(tg_id=tg_id)
        self.params.append(f'token={tg_note.access_token}')

    def get_url(self) -> str:
        return self.url + "?" + "&".join(self.params)
