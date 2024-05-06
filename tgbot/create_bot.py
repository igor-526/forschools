from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from dls.settings import TG_BOT_TOKEN

dp = Dispatcher()
bot = Bot(token=TG_BOT_TOKEN,
          parse_mode=ParseMode.HTML)
