from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
import os

dp = Dispatcher()
bot = Bot(token=os.environ.get('TELEGRAM_BOT_TOKEN'),
          parse_mode=ParseMode.HTML)