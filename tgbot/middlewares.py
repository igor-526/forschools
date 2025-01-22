from pprint import pprint
from typing import Callable, Dict, Any, Awaitable
from profile_management.models import Telegram
from aiogram import BaseMiddleware
from aiogram.types import Message, CallbackQuery
import traceback
from support.models import TelegramErrorsLog
from tgbot.create_bot import bot


async def middleware_authorization(tg_id, message_id, msg_text=None):
    user = await Telegram.objects.select_related("user").filter(tg_id=tg_id).afirst()
    if user:
        await user.set_last_message(message_id=message_id)
        if user.user.is_active:
            await user.user.aupdate_last_activity()
            return user
        else:
            await bot.send_message(chat_id=tg_id,
                                   text="Ваш аккаунт деактивирован. Свяжитесь с администратором для помощи")
    else:
        if "/start" in msg_text:
            return True
        else:
            await bot.send_message(chat_id=tg_id,
                                   text="Для использования бота необходимо авторизоваться. Свяжитесь с администратором "
                                        "для помощи")
            return False


async def log_error(at: int = 0, tg_note: Telegram = None,
                    event: Message | CallbackQuery = None,
                    exception: Exception = None):
    def get_message_params():
        params = {"attachments": [],
                  "message_id": event.message_id,
                  "message_text": None}
        if event.text:
            params["message_text"] = event.text
        if event.caption:
            params["message_text"] = event.caption
        if event.animation:
            params["attachments"].append("Анимация")
        if event.audio:
            params["attachments"].append("Аудиозапись")
        if event.document:
            params["attachments"].append("Документ")
        if event.photo:
            params["attachments"].append("Изображение")
        if event.sticker:
            params["attachments"].append("Стикер")
        if event.video:
            params["attachments"].append("Видео")
        if event.video_note:
            params["attachments"].append("Видеосообщение")
        if event.voice:
            params["attachments"].append("Голосовое сообщение")
        return params

    def get_callback_params():
        params = {"message_id": event.message.message_id,
                  "message_text": event.message.text if event.message.text else None}
        return params

    tb = exception.__traceback__
    traceback_log = traceback.format_exception(type(exception), exception, tb)
    traceback_log = list(filter(lambda s: len(s) != s.count("^") + s.count(" "), traceback_log))
    await TelegramErrorsLog.objects.acreate(
        action_type=at,
        tg_id=event.from_user.id,
        tg_note=tg_note,
        error=str(exception),
        traceback_log=traceback_log,
        params=get_message_params() if at == 0 else get_callback_params(),
    )


class LastMessageMiddleware(BaseMiddleware):
    async def __call__(
            self,
            handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
            event: Message,
            data: Dict[str, Any]
    ) -> Any:
        tguser_note = await middleware_authorization(event.from_user.id, event.message_id, event.text)
        if tguser_note:
            try:
                return await handler(event, data)
            except Exception as e:
                await bot.send_message(chat_id=event.from_user.id,
                                       text="На сервере произошла ошибка. Не беспокойтесь, тех. отдел уже уведомлён и "
                                            "скоро всё исправит :)")
                await log_error(at=0,
                                tg_note=tguser_note if type(tguser_note) == Telegram else None,
                                event=event,
                                exception=e)


class LastMessageCallbackMiddleware(BaseMiddleware):
    async def __call__(
            self,
            handler: Callable[[CallbackQuery, Dict[str, Any]], Awaitable[Any]],
            event: CallbackQuery,
            data: Dict[str, Any]
    ) -> Any:
        tguser_note = await middleware_authorization(event.from_user.id, event.message.message_id)
        if tguser_note:
            try:
                return await handler(event, data)
            except Exception as e:
                await bot.send_message(chat_id=event.from_user.id,
                                       text="На сервере произошла ошибка. Не беспокойтесь, тех. отдел уже уведомлён и "
                                            "скоро всё исправит :)")
                await log_error(at=1,
                                tg_note=tguser_note if type(tguser_note) == Telegram else None,
                                event=event,
                                exception=e)
