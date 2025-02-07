import os
from random import randint


def keyboard_anti_cache_url(path: str = "/"):
    url = f'https://{os.environ.get("DJANGO_ALLOWED_HOST")}'
    url += path
    n = randint(10000, 99999)
    return f'{url}?ac={n}'