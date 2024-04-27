from aiogram import types
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from tgbot.keyboards.callbacks.homework import HomeworkCallback
from tgbot.keyboards.materials import get_keyboard_query
from tgbot.keyboards.homework import (get_homework_item_buttons, get_homeworks_buttons,
                                      get_hwlogs_buttons)
from tgbot.keyboards.default import ready_cancel_keyboard, yes_cancel_keyboard
from tgbot.finite_states.homework import HomeworkFSM
from tgbot.funcs.menu import send_menu
from tgbot.utils import get_tg_id
from homework.models import Homework, HomeworkLog
from material.models import File
from tgbot.create_bot import bot
from tgbot.utils import get_group_and_perms, get_user
from homework.utils import status_code_to_string
from material.utils.get_type import get_type
from aiogram.utils.media_group import MediaGroupBuilder
from dls.settings import MEDIA_ROOT


async def show_homework_queryset(message: types.Message):
    user = await get_user(message.from_user.id)
    gp = await get_group_and_perms(user.id)
    groups = gp.get('groups')
    if 'Listener' in groups:
        homeworks = list(filter(lambda hw: hw['hw_status'] in [1, 2, 5],
                                [{
                                    'hw': hw,
                                    'hw_status': (await hw.aget_status()).status
                                } async for hw in Homework.objects.filter(listener=user)]))
        homeworks = [hw.get('hw') for hw in homeworks]
        if len(homeworks) == 0:
            await message.answer(text="Нет домашних заданий для выполнения")
        else:
            await message.answer(text="Вот домашние задания, которые ждут Вашего выполнения:",
                             reply_markup=get_homeworks_buttons(homeworks))
    elif 'Teacher' in groups:
        homeworks = list(filter(lambda hw: hw['hw_status'] == 3,
                                [{
                                    'hw': hw,
                                    'hw_status': (await hw.aget_status()).status
                                } async for hw in Homework.objects.filter(teacher=user)]))
        homeworks = [hw.get('hw') for hw in homeworks]
        if  len(homeworks) == 0:
            await message.answer(text="Нет домашних заданий для проверки")
        await message.answer(text="Вот домашние задания, которые ждут Вашей проверки:",
                             reply_markup=get_homeworks_buttons(homeworks))
    else:
        await message.answer("Для Вашей роли данная функция в Telegram недоступна")


async def show_homework(callback: CallbackQuery, callback_data: HomeworkCallback):
    hw = await (Homework.objects.select_related("listener")
                .select_related("teacher")
                .aget(pk=callback_data.hw_id))
    hw_status = await hw.aget_status()
    user = await get_user(callback.from_user.id)
    gp = await get_group_and_perms(user.id)
    materials = await hw.materials.acount()
    can_send = 'Listener' in gp['groups'] and hw_status.status in [1, 2, 5]
    can_check = 'Teacher' in gp['groups'] and hw_status.status in [3]

    await bot.send_message(chat_id=callback.from_user.id,
                           text=f"Домашнее задание: <b>{hw.name}</b>\n"
                                f"Срок выполнения: {hw.deadline}\n"
                                f"Описание: {hw.description}\n",
                           reply_markup=get_homework_item_buttons(hw.id,
                                                                  can_send,
                                                                  can_check,
                                                                  materials))
    if hw_status.status == 1 and gp['groups'] == 'Listener':
        await hw.aopen()
    await show_log_item(callback, hw_status.id)


async def show_materials(callback: CallbackQuery, callback_data: HomeworkCallback):
    hw = await (Homework.objects.select_related("listener")
                .select_related("teacher")
                .aget(pk=callback_data.hw_id))
    materials = [{
        'id': mat.id,
        'name': mat.name
    } async for mat in hw.materials.all()]
    await bot.send_message(chat_id=callback.from_user.id,
                           text=f"Материалы к домашнему заданию: <b>{hw.name}</b>:",
                           reply_markup=get_keyboard_query(materials))


async def show_logs(callback: CallbackQuery, callback_data: HomeworkCallback):
    logs = [{
        'id': log.id,
        'status': status_code_to_string(log.status),
        'dt': log.dt.astimezone().strftime("%d.%m %H:%M"),
    } async for log in HomeworkLog.objects.filter(homework=callback_data.hw_id)]
    await bot.send_message(chat_id=callback.from_user.id,
                           text="История ДЗ:",
                           reply_markup=get_hwlogs_buttons(logs))


async def show_log_item(callback: CallbackQuery, log_id: int):
    log = await HomeworkLog.objects.select_related("user").select_related("homework").aget(pk=log_id)
    files = [_ async for _ in log.files.all()]
    msg = (f"<b>{log.homework.name}</b>\n"
           f"<b>{log.user}: {status_code_to_string(log.status)}</b> - {log.dt.astimezone().strftime('%d.%m %H:%M')}\n\n"
           f"{log.comment}\n")
    await bot.send_message(chat_id=callback.from_user.id,
                           text=msg)
    if len(files) > 0:
        album_builder = MediaGroupBuilder()
        for file in files:
            file_type = get_type(file.path.path.split(".")[-1])
            if file_type == "image_formats":
                if file.tg_url:
                    album_builder.add_photo(media=file.tg_url)
                else:
                    album_builder.add_photo(media=types.FSInputFile(file.path.path))
            if file_type == "video_formats":
                if file.tg_url:
                    album_builder.add_video(media=file.tg_url)
                else:
                    album_builder.add_video(media=types.FSInputFile(file.path.path))
            elif file_type == "audio_formats":
                if file.tg_url:
                    await bot.send_audio(chat_id=callback.from_user.id,
                                         audio=file.tg_url)
                else:
                    await bot.send_audio(chat_id=callback.from_user.id,
                                         audio=types.FSInputFile(file.path.path))
            elif file_type == "voice_formats":
                if file.tg_url:
                    await bot.send_voice(chat_id=callback.from_user.id,
                                         voice=file.tg_url)
                else:
                    await bot.send_voice(chat_id=callback.from_user.id,
                                         voice=types.FSInputFile(file.path.path))
        photos = album_builder.build()
        if photos:
            await bot.send_media_group(chat_id=callback.from_user.id,
                                       media=photos)


async def send_hw_answer(callback: CallbackQuery,
                         callback_data: HomeworkCallback,
                         state: FSMContext):
    hw = await (Homework.objects.select_related("listener")
                .select_related("teacher")
                .aget(pk=callback_data.hw_id))
    hw_status = await hw.aget_status()
    user = await get_user(callback.from_user.id)
    gp = await get_group_and_perms(user.id)
    if 'Listener' in gp['groups'] and hw_status.status in [1, 2, 5]:
        await bot.send_message(chat_id=callback.from_user.id,
                               text="Отправьте мне сообщения, содержащие решение домашнего задания, "
                                    "после чего нажмите кнопку 'Готово'\nВы можете отправить текст, фотографии, аудио, "
                                    "видео или голосовые сообщения",
                               reply_markup=ready_cancel_keyboard)
        await state.set_state(HomeworkFSM.send_hw_files)
        await state.update_data({'files': {
            'text': [],
            'photo': [],
            'voice': [],
            'audio': [],
            'video': [],
        }, 'action': 'send',
            'hw_id': callback_data.hw_id})
    else:
        await bot.send_message(callback.from_user.id,
                               text="На данный момент Вы не можете отправить решение")


async def send_hw_check(callback: CallbackQuery,
                        callback_data: HomeworkCallback,
                        state: FSMContext):
    hw = await (Homework.objects.select_related("listener")
                .select_related("teacher")
                .aget(pk=callback_data.hw_id))
    hw_status = await hw.aget_status()
    user = await get_user(callback.from_user.id)
    gp = await get_group_and_perms(user.id)
    if 'Teacher' in gp['groups'] and hw_status.status in [3]:
        await bot.send_message(chat_id=callback.from_user.id,
                               text="Отправьте мне сообщения, содержащие проверку домашнего задания, "
                                    "после чего нажмите кнопку 'Готово'\nВы можете отправить текст, фотографии, аудио, "
                                    "видео или голосовые сообщения",
                               reply_markup=ready_cancel_keyboard)
        await state.set_state(HomeworkFSM.send_hw_files)
        await state.update_data({'files': {
            'text': [],
            'photo': [],
            'voice': [],
            'audio': [],
            'video': [],
        }, 'action': callback_data.action,
            'hw_id': callback_data.hw_id})
    else:
        await bot.send_message(callback.from_user.id,
                               text="На данный момент Вы не можете проверить ДЗ")


async def add_files(message: types.Message, state: FSMContext):
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


async def filedownloader(data, owner) -> dict:
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
    print(MEDIA_ROOT)
    for photo in photos:
        await bot.download(file=photo,
                           destination=f"{MEDIA_ROOT}/files/{photo}.jpg")
        file = await File.objects.acreate(name="ДЗ",
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


def filechecker(data) -> bool:
    photos = data.get("files").get("photo")
    voices = data.get("files").get("voice")
    text = data.get("files").get('text')
    audio = data.get("files").get('audio')
    video = data.get("files").get('video')
    return len(photos) + len(voices) + len(text) + len(audio) + len(video) != 0


async def hw_send(message: types.Message, state: FSMContext):
    data = await state.get_data()
    if not filechecker(data):
        await message.answer("Вы не можете отправить путой ответ. Пожалуйста, пришлите мне текст, фотографии, "
                             "аудио или голосовые сообщения")
        return
    hw = await (Homework.objects.select_related("teacher")
                .select_related("listener").aget(pk=data.get("hw_id")))
    user = await get_user(message.from_user.id)
    hwdata = await filedownloader(data, owner=user)
    status = None
    if data.get('action') == 'send':
        status = 3
    elif data.get('action') == 'check_accept':
        status = 4
    elif data.get('action') == 'check_revision':
        status = 5
    if status:
        hwlog = await HomeworkLog.objects.acreate(homework=hw,
                                                  user=user,
                                                  comment=hwdata.get("comment"),
                                                  status=status)
        await hwlog.files.aset(hwdata.get("files_db"))
        await hwlog.asave()
    if data.get('action') == 'send':
        await message.answer("Решение успешно отправлено\n"
                             "Ожидайте ответа преподавателя")
        teacher_tg = await get_tg_id(hw.teacher)
        if teacher_tg:
            await bot.send_message(chat_id=teacher_tg,
                                   text=f"Пришёл новый ответ от ученика по ДЗ <b>'{hw.name}'</b>",
                                   reply_markup=get_homeworks_buttons([hw]))
    elif data.get('action') in ['check_accept', 'check_revision']:
        await message.answer("Ответ был отправлен")
        listener_tg = await get_tg_id(hw.listener)
        if listener_tg:
            await bot.send_message(chat_id=listener_tg,
                                   text=f"Пришёл новый ответ от преподавателя по ДЗ <b>'{hw.name}'</b>",
                                   reply_markup=get_homeworks_buttons([hw]))
    await send_menu(message, state)
