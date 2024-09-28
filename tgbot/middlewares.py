from typing import Callable, Dict, Any, Awaitable
from profile_management.models import Telegram
from aiogram import BaseMiddleware
from aiogram.types import Message, CallbackQuery
from tgbot.create_bot import bot


async def middleware_authorization(tg_id, message_id):
    user = await Telegram.objects.select_related("user").filter(tg_id=tg_id).afirst()
    if user:
        await user.set_last_message(message_id=message_id)
        if user.user.is_active:
            return user
        else:
            await bot.send_message(chat_id=tg_id,
                                   text="Ваш аккаунт деактивирован. Свяжитесь с администратором для помощи")
    else:
        await bot.send_message(chat_id=tg_id,
                               text="Для использования бота необходимо авторизоваться. Свяжитесь с администратором "
                                    "для помощи")
        return False


class LastMessageMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message,
        data: Dict[str, Any]
    ) -> Any:
        tguser_note = await middleware_authorization(event.from_user.id, event.message_id)
        if tguser_note:
            return await handler(event, data)


class LastMessageCallbackMiddleware(BaseMiddleware):
    async def __call__(
            self,
            handler: Callable[[CallbackQuery, Dict[str, Any]], Awaitable[Any]],
            event: CallbackQuery,
            data: Dict[str, Any]
    ) -> Any:
        tguser_note = await middleware_authorization(event.from_user.id, event.message.message_id)
        if tguser_note:
            return await handler(event, data)
