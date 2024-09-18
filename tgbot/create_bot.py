import os
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.fsm.storage.redis import RedisStorage
from dls.settings import TG_BOT_TOKEN


storage = RedisStorage.from_url(f'redis://{os.environ.get("REDIS_HOST")}:6379/2')
dp = Dispatcher(storage=storage)
bot = Bot(token=TG_BOT_TOKEN,
          parse_mode=ParseMode.HTML)
