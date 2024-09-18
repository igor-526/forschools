from typing import Callable, Dict, Any, Awaitable
from profile_management.models import Telegram
from aiogram import BaseMiddleware
from aiogram.types import Message, CallbackQuery


class LastMessageMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message,
        data: Dict[str, Any]
    ) -> Any:
        tguser_note = await Telegram.objects.filter(tg_id=event.from_user.id).afirst()
        if tguser_note:
            await tguser_note.set_last_message(message_id=event.message_id)
        return await handler(event, data)


class LastMessageCallbackMiddleware(BaseMiddleware):
    async def __call__(
            self,
            handler: Callable[[CallbackQuery, Dict[str, Any]], Awaitable[Any]],
            event: CallbackQuery,
            data: Dict[str, Any]
    ) -> Any:
        tguser_note = await Telegram.objects.filter(tg_id=event.from_user.id).afirst()
        if tguser_note:
            await tguser_note.set_last_message(message_id=event.message.message_id)
        return await handler(event, data)
