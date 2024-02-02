from django.core.management.base import BaseCommand, CommandError
from tgbot.create_bot import dp, bot
import asyncio


async def start() -> None:
    await dp.start_polling(bot)


class Command(BaseCommand):
    help = 'This command starts up the Telegram bot'

    def handle(self, *args, **kwargs):
        try:
            asyncio.run(start())
        except Exception as ex:
            raise CommandError(ex)
