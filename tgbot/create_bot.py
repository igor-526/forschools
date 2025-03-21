from aiogram import Bot, Dispatcher
from aiogram.client.bot import DefaultBotProperties
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.client.telegram import TelegramAPIServer
from aiogram.enums import ParseMode
from aiogram.fsm.storage.redis import RedisStorage
from dls.settings import TG_BOT_TOKEN, TG_REDIS_URL, TG_SERVER_URL

session = AiohttpSession(
    api=TelegramAPIServer.from_base(TG_SERVER_URL)
)

storage = RedisStorage.from_url(TG_REDIS_URL)
dp = Dispatcher(storage=storage)
bot = Bot(token=TG_BOT_TOKEN,
          session=session,
          default=DefaultBotProperties(parse_mode=ParseMode.HTML))
