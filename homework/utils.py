import async_to_sync as sync
from tgbot.create_bot import bot


class AiogramFuncs:
    async def send_homework(self,
                            tg_id: int,
                            text: str,
                            keys=None):
        await bot.send_message(chat_id=tg_id,
                               text=text,
                               reply_markup=keys)


async_objects = AiogramFuncs()
telegram = sync.methods(async_objects)
