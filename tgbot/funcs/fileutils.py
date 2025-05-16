from aiogram.exceptions import TelegramBadRequest
from aiogram.types import FSInputFile
from material.models import File
from material.utils import get_type_by_ext
from tgbot.create_bot import bot


async def send_file(tg_id: int, file_object: File, reply_markup=None, protect=False) -> None:
    file = file_object.tg_url if file_object.tg_url else FSInputFile(path=file_object.path.path)
    file_type = get_type_by_ext(file_object.path.name.split(".")[-1])
    file_id = None
    if file_type == "image_formats":
        try:
            message = await bot.send_photo(chat_id=tg_id,
                                           photo=file,
                                           protect_content=protect,
                                           caption=file_object.caption,
                                           reply_markup=reply_markup)
            try:
                file_id = message.photo[-1].file_id
            except Exception:
                file_id = None
        except TelegramBadRequest:
            message = await bot.send_document(chat_id=tg_id,
                                              document=file,
                                              protect_content=protect,
                                              caption=file_object.caption,
                                              reply_markup=reply_markup)
            try:
                file_id = message.document.file_id
            except Exception:
                file_id = None
    elif file_type == "animation_formats":
        message = await bot.send_animation(chat_id=tg_id,
                                           animation=file,
                                           protect_content=protect,
                                           caption=file_object.caption,
                                           reply_markup=reply_markup)
        try:
            if message.animation:
                file_id = message.animation.file_id
            else:
                file_id = message.document.file_id
        except Exception:
            file_id = None
    elif file_type in ["pdf_formats", "archive_formats", "presentation_formats", "word_formats"]:
        message = await bot.send_document(chat_id=tg_id,
                                          document=file,
                                          protect_content=protect,
                                          caption=file_object.caption,
                                          reply_markup=reply_markup)
        try:
            file_id = message.document.file_id
        except Exception:
            file_id = None
    elif file_type == "video_formats":
        message = await bot.send_video(chat_id=tg_id,
                                       video=file,
                                       protect_content=protect,
                                       caption=file_object.caption,
                                       reply_markup=reply_markup)
        try:
            file_id = message.video.file_id
        except Exception:
            file_id = None
    elif file_type == "audio_formats":
        message = await bot.send_audio(chat_id=tg_id,
                                       audio=file,
                                       protect_content=protect,
                                       caption=file_object.caption,
                                       reply_markup=reply_markup)
        try:
            file_id = message.audio.file_id
        except Exception:
            file_id = None
    elif file_type == "voice_formats":
        message = await bot.send_voice(chat_id=tg_id,
                                       voice=file,
                                       protect_content=protect,
                                       reply_markup=reply_markup)
        try:
            file_id = message.voice.file_id
        except Exception:
            file_id = None
    if not file_object.tg_url and file_id:
        file_object.tg_url = file_id
        await file_object.asave()
