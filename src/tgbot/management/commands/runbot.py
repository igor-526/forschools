import asyncio
import logging
import os

from aiogram.webhook.aiohttp_server import (SimpleRequestHandler,
                                            setup_application)

from aiohttp import web

from django.core.management.base import BaseCommand, CommandError

from dls.settings import (DEBUG,
                          TG_WEBHOOKS_MODE,
                          TG_WEBHOOK_PATH,
                          TG_WEBHOOK_SECRET,
                          TG_WEB_SERVER_HOST)

from tgbot.create_bot import bot, dp
from tgbot.handlers import router as main_router
from tgbot.middlewares import (LastMessageCallbackMiddleware,
                               LastMessageMiddleware,
                               MediaMiddleware)


async def start_polling() -> None:
    dp.include_routers(main_router)
    # if not DEBUG:
    dp.message.middleware.register(LastMessageMiddleware())
    dp.callback_query.middleware.register(LastMessageCallbackMiddleware())
    dp.message.middleware.register(MediaMiddleware())
    await dp.start_polling(bot)


async def on_startup(bot) -> None:
    await bot.set_webhook(f"{os.environ.get('DJANGO_ALLOWED_HOST')}"
                          f"{TG_WEBHOOK_PATH}",
                          secret_token=TG_WEBHOOK_SECRET)


class Command(BaseCommand):
    help = 'This command starts up the Telegram bot'

    def handle(self, *args, **kwargs):
        # try:
        logging.getLogger().setLevel(logging.DEBUG)
        if TG_WEBHOOKS_MODE:
            dp.include_routers(main_router)
            if not DEBUG:
                dp.message.middleware.register(LastMessageMiddleware())
                dp.callback_query.middleware.register(
                    LastMessageCallbackMiddleware())
            dp.message.middleware.register(MediaMiddleware())
            dp.startup.register(on_startup)
            app = web.Application()
            webhook_requests_handler = SimpleRequestHandler(
                dispatcher=dp,
                bot=bot,
                secret_token=TG_WEBHOOK_SECRET,
            )
            webhook_requests_handler.register(app, path=TG_WEBHOOK_PATH)
            setup_application(app, dp, bot=bot)
            web.run_app(app, host=TG_WEB_SERVER_HOST, port=8080)
        else:
            asyncio.run(start_polling())
        # except Exception as ex:
        #     raise CommandError(ex)
