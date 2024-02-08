from aiogram import Bot, Dispatcher
import os

dp = Dispatcher()
bot = Bot(token=os.environ.get('TELEGRAM_BOT_TOKEN'))
