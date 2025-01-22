from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.fsm.storage.redis import RedisStorage
from dls.settings import TG_BOT_TOKEN, TG_REDIS_URL


storage = RedisStorage.from_url(TG_REDIS_URL)
dp = Dispatcher(storage=storage)
bot = Bot(token=TG_BOT_TOKEN,
          parse_mode=ParseMode.HTML)
