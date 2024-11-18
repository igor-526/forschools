import os
from pprint import pprint

import cv2
from aiogram import types
from aiogram.exceptions import TelegramBadRequest
from aiogram.fsm.context import FSMContext
from aiogram.types import FSInputFile
from PIL import Image
from django.db.models import Q
from dls.settings import MEDIA_ROOT
from material.models import File
from material.utils.get_type import get_type
from tgbot.create_bot import bot


async def add_files_to_state(message: types.Message, state: FSMContext) -> str:
    async def get_materials_from_message(msg: types.Message):
        msgstring = ""
        if msg.text:
            data.get('files').get('text').append(msg.text)
            await state.update_data(data)
            msgstring += "Принято текстовое сообщение"
        if msg.voice:
            data.get('files').get('voice').append(msg.voice.file_id)
            await state.update_data(data)
            msgstring += "Принято голосовое сообщение"
        if msg.photo:
            data.get("files").get('photo').append({"file_id": msg.photo[-1].file_id,
                                                   "caption": msg.caption if msg.caption else None})
            await state.update_data(data)
            msgstring += f"Принято изображение{' с подписью' if msg.caption else ''}"
        if msg.audio:
            data.get("files").get('audio').append({'file_id': msg.audio.file_id,
                                                   'format': msg.audio.file_name.split(".")[-1],
                                                   "caption": msg.caption if msg.caption else None})
            await state.update_data(data)
            msgstring += f"Принята аудиозапись{' с подписью' if msg.caption else ''}"
        if msg.animation:
            file_format = msg.animation.file_name.split(".")[-1] if msg.animation.file_name else "mp4"
            data.get("files").get('animation').append({'file_id': msg.animation.file_id,
                                                       'format': file_format,
                                                       "caption": msg.caption if msg.caption else None})
            await state.update_data(data)
            msgstring += f"Принята анимация{' с подписью' if msg.caption else ''}"
        if msg.document:
            if not msg.animation:
                file_type = get_type(msg.document.file_name.split(".")[-1])
                if file_type != "unsupported":
                    data.get("files").get('document').append({'file_id': msg.document.file_id,
                                                              'name': msg.document.file_name,
                                                              "caption": msg.caption if msg.caption else None})
                    await state.update_data(data)
                    msgstring += f"Принят документ{' с подписью' if message.caption else ''}"
                else:
                    await message.answer("Данный файл не может быть отправлен, так как формат не поддерживается")
        if msg.video:
            data.get("files").get('video').append({"file_id": msg.video.file_id,
                                                   "caption": msg.caption if msg.caption else None})
            await state.update_data(data)
            msgstring += f"Принята видеозапись{' с подписью' if msg.caption else ''}"
        return msgstring

    data = await state.get_data()
    msgstr = await get_materials_from_message(message)
    if not data.get("files"):
        data["files"] = {
            'text': [],
            'voice': [],
            'photo': [],
            'audio': [],
            'animation': [],
            'video': [],
            'document': []
        }
    if message.reply_to_message:
        msgstr += "\n" + await get_materials_from_message(message.reply_to_message)
    return msgstr


def filechecker(data) -> bool:
    photos = data.get("files").get("photo")
    voices = data.get("files").get("voice")
    text = data.get("files").get('text')
    audio = data.get("files").get('audio')
    video = data.get("files").get('video')
    animation = data.get("files").get('animation')
    document = data.get("files").get('document')
    return len(photos) + len(voices) + len(text) + len(audio) + len(video) + len(animation) + len(document) != 0


async def filedownloader(data, owner, t="ДЗ", error_reply: types.Message = None) -> dict:
    photos = data.get("files").get("photo")
    voices = data.get("files").get("voice")
    text = data.get("files").get('text')
    audio = data.get("files").get('audio')
    videos = data.get("files").get('video')
    animations = data.get("files").get('animation')
    documents = data.get("files").get('document')
    if not text:
        comment = "-"
    else:
        comment = "<br>__<br>".join(text)
    files_db = []
    for photo in photos:
        try:
            file = await File.objects.filter(Q(tg_url=photo.get("file_id")) |
                                             Q(path=f"files/{photo.get('file_id')}.jpg")).afirst()
            if not file:
                await bot.download(file=photo.get("file_id"),
                                   destination=f"{MEDIA_ROOT}/files/{photo.get('file_id')}.jpg")
                file = await File.objects.acreate(name=t,
                                                  path=f"files/{photo.get('file_id')}.jpg",
                                                  tg_url=photo.get("file_id"),
                                                  caption=photo.get("caption"),
                                                  owner=owner)
            files_db.append(file)
        except Exception as e:
            if error_reply:
                await error_reply.answer(text=f"Не удалось загрузить изображение\nОшибка: {e}")
    for voice in voices:
        try:
            file = await File.objects.filter(Q(tg_url=voice) |
                                             Q(path=f"files/{voice}.ogg")).afirst()
            if not file:
                await bot.download(file=voice,
                                   destination=f"{MEDIA_ROOT}/files/{voice}.ogg")
                file = await File.objects.acreate(name=t,
                                                  path=f"files/{voice}.ogg",
                                                  tg_url=voice,
                                                  owner=owner)
            files_db.append(file)
        except Exception as e:
            if error_reply:
                await error_reply.answer(text=f"Не удалось загрузить голосовое сообщение\nОшибка: {e}")
    for aud in audio:
        try:
            file = await File.objects.filter(Q(tg_url=aud.get('file_id')) |
                                             Q(path=f"files/{aud.get('file_id')}.{aud.get('format')}")).afirst()
            if not file:
                await bot.download(file=aud.get("file_id"),
                                   destination=f"{MEDIA_ROOT}/files/{aud.get('file_id')}.{aud.get('format')}")
                file = await File.objects.acreate(name=t,
                                                  path=f"files/{aud.get('file_id')}.{aud.get('format')}",
                                                  tg_url=aud.get('file_id'),
                                                  caption=aud.get("caption"),
                                                  owner=owner)
            files_db.append(file)
        except Exception as e:
            if error_reply:
                await error_reply.answer(text=f"Не удалось загрузить аудио\nОшибка: {e}")
    for video in videos:
        try:
            file = await File.objects.filter(Q(tg_url=video.get('file_id')) |
                                             Q(path=f"files/{video.get('file_id')}.webm")).afirst()
            if not file:
                await bot.download(file=video.get('file_id'),
                                   destination=f"{MEDIA_ROOT}/files/{video.get('file_id')}.webm")
                file = await File.objects.acreate(name=t,
                                                  path=f"files/{video.get('file_id')}.webm",
                                                  tg_url=video.get('file_id'),
                                                  caption=video.get('caption'),
                                                  owner=owner)
            files_db.append(file)
        except Exception as e:
            if error_reply:
                await error_reply.answer(text=f"Не удалось загрузить видео\nОшибка: {e}")
    for animation in animations:
        try:
            file = await File.objects.filter(Q(tg_url=animation) |
                                             Q(path=f"files/{animation.get('file_id')}.gif")).afirst()
            if not file:
                file_format = animation.get('format')
                path = os.path.join(MEDIA_ROOT, "files", f"{animation.get('file_id')}.{file_format}")
                await bot.download(file=animation.get('file_id'),
                                   destination=path)
                if file_format != "gif":
                    video = cv2.VideoCapture(path)
                    frames = []
                    while True:
                        ret, frame = video.read()
                        if not ret:
                            break
                        frames.append(frame)
                    for i in range(len(frames)):
                        cv2.imwrite(f"{animation.get('file_id')}{i}.png", frames[i])
                    frame_images = [Image.open(f"{animation.get('file_id')}{i}.png") for i in range(len(frames))]
                    frame_images[0].save(f"{MEDIA_ROOT}/files/{animation.get('file_id')}.gif",
                                         format='GIF',
                                         append_images=frame_images[1:],
                                         save_all=True,
                                         duration=100,
                                         loop=0)
                    for i in range(len(frames)):
                        os.remove(f"{animation.get('file_id')}{i}.png")
                file = await File.objects.acreate(name=t,
                                                  path=f"files/{animation.get('file_id')}.gif",
                                                  tg_url=animation.get('file_id'),
                                                  caption=animation.get("caption"),
                                                  owner=owner)
            files_db.append(file)
        except Exception as e:
            if error_reply:
                await error_reply.answer(text=f"Не удалось загрузить анимацию\nОшибка: {e}")
    for document in documents:
        try:
            file = await File.objects.filter(Q(tg_url=document.get('file_id')) |
                                             Q(path=f"files/{document.get('file_id')}."
                                                    f"{document.get('name').split('.')[-1]}")).afirst()
            if not file:
                await bot.download(file=document.get("file_id"),
                                   destination=f"{MEDIA_ROOT}/files/{document.get('file_id')}."
                                               f"{document.get('name').split('.')[-1]}")
                file = await File.objects.acreate(name=document.get('name'),
                                                  path=f"files/{document.get('file_id')}."
                                                       f"{document.get('name').split('.')[-1]}",
                                                  tg_url=document.get('file_id'),
                                                  caption=document.get('caption'),
                                                  owner=owner)
            files_db.append(file)
        except Exception as e:
            if error_reply:
                await error_reply.answer(text=f"Не удалось загрузить документ\nОшибка: {e}")
    return {'files_db': files_db,
            'comment': comment}


async def send_file(tg_id: int, file_object: File, protect=False) -> None:
    file = file_object.tg_url if file_object.tg_url else FSInputFile(path=file_object.path.path)
    file_type = get_type(file_object.path.name.split(".")[-1])
    file_id = None
    if file_type == "image_formats":
        try:
            message = await bot.send_photo(chat_id=tg_id,
                                           photo=file,
                                           protect_content=protect,
                                           caption=file_object.caption)
            file_id = message.photo[-1].file_id
        except TelegramBadRequest:
            message = await bot.send_document(chat_id=tg_id,
                                              document=file,
                                              protect_content=protect,
                                              caption=file_object.caption)
            file_id = message.document.file_id
    elif file_type == "animation_formats":
        message = await bot.send_animation(chat_id=tg_id,
                                           animation=file,
                                           protect_content=protect,
                                           caption=file_object.caption)
        if message.animation:
            file_id = message.animation.file_id
        else:
            file_id = message.document.file_id
    elif (file_type == "pdf_formats" or
          file_type == "archive_formats" or
          file_type == "presentation_formats"):
        message = await bot.send_document(chat_id=tg_id,
                                          document=file,
                                          protect_content=protect,
                                          caption=file_object.caption)
        file_id = message.document.file_id
    elif file_type == "video_formats":
        message = await bot.send_video(chat_id=tg_id,
                                       video=file,
                                       protect_content=protect,
                                       caption=file_object.caption)
        file_id = message.video.file_id
    elif file_type == "audio_formats":
        message = await bot.send_audio(chat_id=tg_id,
                                       audio=file,
                                       protect_content=protect,
                                       caption=file_object.caption)
        file_id = message.audio.file_id
    elif file_type == "voice_formats":
        message = await bot.send_voice(chat_id=tg_id,
                                       voice=file,
                                       protect_content=protect)
        file_id = message.voice.file_id
    if not file_object.tg_url and file_id:
        file_object.tg_url = file_id
        await file_object.asave()
