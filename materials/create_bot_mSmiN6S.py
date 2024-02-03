from aiogram import Bot
from aiogram.dispatcher import Dispatcher
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from config import token

bot = Bot(token=token)
storage = MemoryStorage()
dp = Dispatcher(bot, storage=storage)
