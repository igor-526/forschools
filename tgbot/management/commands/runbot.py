from django.core.management.base import BaseCommand, CommandError
from tgbot.handlers import router as main_router
from tgbot.create_bot import dp, bot
import asyncio
import logging
import os
from tgbot.middlewares import LastMessageMiddleware, LastMessageCallbackMiddleware
from dls.settings import (DEBUG, TG_WEBHOOKS_MODE, TG_WEB_SERVER_HOST,
                          TG_WEBHOOK_SECRET, TG_WEBHOOK_PATH)
from aiohttp import web
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application


async def start() -> None:
    dp.include_routers(main_router)
    if not DEBUG:
        dp.message.middleware.register(LastMessageMiddleware())
        dp.callback_query.middleware.register(LastMessageCallbackMiddleware())
    if TG_WEBHOOKS_MODE:
        await bot.set_webhook(f"{os.environ.get('DJANGO_ALLOWED_HOST')}{TG_WEBHOOK_PATH}",
                              secret_token=TG_WEBHOOK_SECRET)
    else:
        await dp.start_polling(bot)


class Command(BaseCommand):
    help = 'This command starts up the Telegram bot'

    def handle(self, *args, **kwargs):
        try:
            logging.getLogger().setLevel(logging.DEBUG)
            asyncio.run(start())
            if TG_WEBHOOKS_MODE:
                app = web.Application()
                webhook_requests_handler = SimpleRequestHandler(
                    dispatcher=dp,
                    bot=bot,
                    secret_token=TG_WEBHOOK_SECRET,
                )
                webhook_requests_handler.register(app, path=TG_WEBHOOK_PATH)
                setup_application(app, dp, bot=bot)
                print("WH STARTING")
                web.run_app(app, host=TG_WEB_SERVER_HOST, port=8080)
                print("WH STARTED")
        except Exception as ex:
            raise CommandError(ex)
