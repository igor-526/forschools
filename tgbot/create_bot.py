from aiogram import Bot, Dispatcher
from tgbot.handlers import router as main_router
import os

dp = Dispatcher()
dp.include_routers(main_router)
bot = Bot(token=os.environ.get('TELEGRAM_BOT_TOKEN'))
