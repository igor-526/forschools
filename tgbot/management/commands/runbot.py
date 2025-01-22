from django.core.management.base import BaseCommand, CommandError
from tgbot.handlers import router as main_router
from tgbot.create_bot import dp, bot
import asyncio
import logging
from tgbot.middlewares import LastMessageMiddleware, LastMessageCallbackMiddleware
from dls.settings import DEBUG


async def start() -> None:
    dp.include_routers(main_router)
    if not DEBUG:
        dp.message.middleware.register(LastMessageMiddleware())
        dp.callback_query.middleware.register(LastMessageCallbackMiddleware())
    await dp.start_polling(bot)


class Command(BaseCommand):
    help = 'This command starts up the Telegram bot'

    def handle(self, *args, **kwargs):
        try:
            logging.getLogger().setLevel(logging.DEBUG)
            asyncio.run(start())
        except Exception as ex:
            raise CommandError(ex)
