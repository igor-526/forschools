from aiogram import types
from aiogram.fsm.context import FSMContext
from aiogram.types import FSInputFile

from dls.settings import MEDIA_ROOT
from material.models import File
from material.utils.get_type import get_type
from tgbot.create_bot import bot


async def add_files_to_state(message: types.Message, state: FSMContext):
    data = await state.get_data()
    if message.text:
        data.get('files').get('text').append(message.text)
    if message.caption:
        data.get('files').get('text').append(message.caption)
    if message.voice:
        data.get('files').get('voice').append(message.voice.file_id)
    if message.photo:
        data.get("files").get('photo').append(message.photo[-1].file_id)
    if message.audio:
        data.get("files").get('audio').append({'file_id': message.audio.file_id,
                                               'format': message.audio.file_name.split(".")[-1]})
    if message.video:
        data.get("files").get('video').append(message.video.file_id)


def filechecker(data) -> bool:
    photos = data.get("files").get("photo")
    voices = data.get("files").get("voice")
    text = data.get("files").get('text')
    audio = data.get("files").get('audio')
    video = data.get("files").get('video')
    return len(photos) + len(voices) + len(text) + len(audio) + len(video) != 0


async def filedownloader(data, owner, t="ДЗ") -> dict:
    photos = data.get("files").get("photo")
    voices = data.get("files").get("voice")
    text = data.get("files").get('text')
    audio = data.get("files").get('audio')
    videos = data.get("files").get('video')
    comment = ""
    if not text:
        comment = "-"
    else:
        for msg in text:
            comment += f"{msg}\n"
    files_db = []
    for photo in photos:
        await bot.download(file=photo,
                           destination=f"{MEDIA_ROOT}/files/{photo}.jpg")
        file = await File.objects.acreate(name=t,
                                          path=f"files/{photo}.jpg",
                                          tg_url=photo,
                                          owner=owner)
        files_db.append(file)
    for voice in voices:
        await bot.download(file=voice,
                           destination=f"{MEDIA_ROOT}/files/{voice}.ogg")
        file = await File.objects.acreate(name="ДЗ",
                                          path=f"files/{voice}.ogg",
                                          tg_url=voice,
                                          owner=owner)
        files_db.append(file)
    for aud in audio:
        await bot.download(file=aud.get("file_id"),
                           destination=f"{MEDIA_ROOT}/files/{aud.get('file_id')}.{aud.get('format')}")
        file = await File.objects.acreate(name="ДЗ",
                                          path=f"files/{aud.get('file_id')}.{aud.get('format')}",
                                          tg_url=aud.get('file_id'),
                                          owner=owner)
        files_db.append(file)
    for video in videos:
        await bot.download(file=video,
                           destination=f"{MEDIA_ROOT}/files/{video}.webm")
        file = await File.objects.acreate(name="ДЗ",
                                          path=f"files/{video}.webm",
                                          tg_url=video,
                                          owner=owner)
        files_db.append(file)
    return {'files_db': files_db,
            'comment': comment}


async def send_file(tg_id: int, file_object: File) -> None:
    print(file_object)
    file = file_object.tg_url if file_object.tg_url else FSInputFile(path=file_object.path.path)
    file_type = get_type(file_object.path.name.split(".")[-1])
    file_id = None
    if file_type == "image_formats":
        message = await bot.send_photo(chat_id=tg_id,
                                       photo=file,
                                       protect_content=True)
        file_id = message.photo[-1].file_id
    elif file_type == "animation_formats":
        message = await bot.send_animation(chat_id=tg_id,
                                           animation=file,
                                           protect_content=True)
        if message.animation:
            file_id = message.animation.file_id
        else:
            file_id = message.document.file_id
    elif (file_type == "pdf_formats" or
          file_type == "archive_formats" or
          file_type == "presentation_formats"):
        message = await bot.send_document(chat_id=tg_id,
                                          document=file,
                                          protect_content=True)
        file_id = message.document.file_id
    elif file_type == "video_formats":
        message = await bot.send_video(chat_id=tg_id,
                                       video=file,
                                       protect_content=True)
        file_id = message.video.file_id
    elif file_type == "audio_formats":
        message = await bot.send_audio(chat_id=tg_id,
                                       audio=file,
                                       protect_content=True)
        file_id = message.audio.file_id
    elif file_type == "voice_formats":
        message = await bot.send_voice(chat_id=tg_id,
                                       voice=file,
                                       protect_content=True)
        file_id = message.voice.file_id
    if not file_object.tg_url and file_id:
        file_object.tg_url = file_id
        await file_object.asave()
