from random import randint


def keyboard_anti_cache_url(url: str = ""):
    n = randint(10000, 99999)
    return f'{url}?ac={n}'