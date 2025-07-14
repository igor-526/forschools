import asyncio
import logging
import traceback
from typing import Any, Awaitable, Callable, Dict, Union

from aiogram import BaseMiddleware
from aiogram.types import CallbackQuery, Message

from profile_management.models import Telegram

from support.models import TelegramErrorsLog

from tgbot.create_bot import bot

logger = logging.getLogger('tg_bot')
logger.setLevel(logging.DEBUG)
log_format = logging.Formatter('[%(asctime)s TG_BOT] %(message)s',
                               datefmt='%H:%M:%S')
file_handler = logging.FileHandler('logs/telegram_platform.log', 'a')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(log_format)
logger.addHandler(file_handler)


async def middleware_authorization(tg_id, message_id, msg_text=None):
    user = await Telegram.objects.select_related(
        "user").filter(tg_id=tg_id).afirst()
    if user:
        await user.set_last_message(message_id=message_id)
        if user.user.is_active:
            await user.user.aupdate_last_activity()
            return user
        else:
            await bot.send_message(chat_id=tg_id,
                                   text="Ваш аккаунт деактивирован. Свяжитесь "
                                        "с администратором для помощи")
    else:
        if "/start" in msg_text:
            return True
        else:
            await bot.send_message(chat_id=tg_id,
                                   text="Для использования бота необходимо "
                                        "авторизоваться. Свяжитесь с "
                                        "администратором для помощи")
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
        params = {
            "message_id": event.message.message_id,
            "message_text": event.message.text if event.message.text else None
        }
        return params

    tb = exception.__traceback__
    traceback_log = traceback.format_exception(type(exception), exception, tb)
    traceback_log = list(filter(
        lambda s: len(s) != s.count("^") + s.count(" "), traceback_log
    ))

    await TelegramErrorsLog.objects.acreate(
        action_type=at,
        tg_id=event.from_user.id,
        tg_note=tg_note,
        error=str(exception),
        traceback_log=traceback_log,
        params=get_message_params() if at in [0, 2] else get_callback_params(),
    )


async def log_action(tg_user_note: Telegram | bool,
                     data: Dict[str, Any],
                     event: Message | CallbackQuery):
    def get_message_info():
        result = dict()
        if isinstance(event, Message):
            text = f'{event.text}' if event.text else event.caption
            media = (event.animation or
                     event.audio or
                     event.document or
                     event.photo or
                     event.video or
                     event.voice)
            result = {"text": f"{text if text else 'без текста'}",
                      "media": "с медиа" if media else "без медиа"}
        if isinstance(event, CallbackQuery):
            text = f'{event.message.text}' if event.message.text \
                else event.message.caption
            media = (event.message.animation or
                     event.message.audio or
                     event.message.document or
                     event.message.photo or
                     event.message.video or
                     event.message.voice)
            result = {"text": f"{text if text else 'без текста'}",
                      "media": "с медиа" if media else "без медиа"}
        return result

    if isinstance(tg_user_note, Telegram):
        message = (f'{tg_user_note.user.first_name} '
                   f'{tg_user_note.user.last_name} '
                   f'({tg_user_note.usertype}): ')
    else:
        message = f'{data["event_from_user"]}: '
    if isinstance(event, Message):
        message += "сообщение\n"
    else:
        message += "callback\n"
    state = data['state']
    state_name = data['raw_state']
    state_data = await state.get_data()
    a_handler = data.get("handler").callback.__name__
    message += f'state_name: {state_name}\n'
    message += f'state_data: {state_data}\n'
    message += f'handler: {a_handler}\n'
    message += f'msg: {get_message_info()}'
    logger.info(f'{message}\n')


def get_error_message(exception: Exception) -> str:
    if "VOICE_MESSAGES_FORBIDDEN" in str(exception):
        error_message = ("Не получилось отправить Вам голосовое сообщение. "
                         "Пожалуйста, проверьте настройки "
                         "Telegram Premium")
    else:
        error_message = ("На сервере произошла ошибка. "
                         "Не беспокойтесь, тех. отдел уже уведомлён и скоро "
                         "всё исправит :)")
    return error_message


class LastMessageMiddleware(BaseMiddleware):
    async def __call__(
            self,
            handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
            event: Message,
            data: Dict[str, Any]
    ) -> Any:
        tg_user_note = await middleware_authorization(event.from_user.id,
                                                      event.message_id,
                                                      event.text)
        await log_action(tg_user_note, data, event)
        if tg_user_note:
            try:
                return await handler(event, data)
            except Exception as e:
                await log_error(
                    at=0,
                    tg_note=tg_user_note if isinstance(tg_user_note,
                                                       Telegram) else None,
                    event=event,
                    exception=e
                )
                await bot.send_message(chat_id=event.from_user.id,
                                       text=get_error_message(e))


class LastMessageCallbackMiddleware(BaseMiddleware):
    async def __call__(
            self,
            handler: Callable[[CallbackQuery, Dict[str, Any]], Awaitable[Any]],
            event: CallbackQuery,
            data: Dict[str, Any]
    ) -> Any:
        tg_user_note = await middleware_authorization(event.from_user.id,
                                                      event.message.message_id)
        await log_action(tg_user_note, data, event)
        if tg_user_note:
            try:
                return await handler(event, data)
            except Exception as e:
                await bot.send_message(chat_id=event.from_user.id,
                                       text=get_error_message(e))
                await log_error(
                    at=1,
                    tg_note=tg_user_note if isinstance(tg_user_note,
                                                       Telegram) else None,
                    event=event,
                    exception=e
                )


class MediaMiddleware(BaseMiddleware):
    def __init__(self, latency: Union[int, float] = 0.05):
        self.medias = {}
        self.latency = latency
        super(MediaMiddleware, self).__init__()

    async def __call__(
            self,
            handler: Callable[[Union[Message, CallbackQuery],
                               Dict[str, Any]], Awaitable[Any]],
            event: Union[Message, CallbackQuery],
            data: Dict[str, Any]
    ) -> Any:

        if isinstance(event, Message) and event.media_group_id:
            try:
                self.medias[event.media_group_id].append(event)
                return
            except KeyError:
                self.medias[event.media_group_id] = [event]
                await asyncio.sleep(self.latency)
                data["media_events"] = self.medias.pop(event.media_group_id)
        return await handler(event, data)
