import os.path
from datetime import datetime
from PIL import Image
import cv2
from dls.settings import MEDIA_ROOT
from material.models import Material, MaterialCategory
from material.utils.get_type import get_type
from tgbot.create_bot import bot
from tgbot.utils import get_group_and_perms, get_user
from aiogram.fsm.context import FSMContext
from aiogram import types
from tgbot.keyboards.default import cancel_keyboard
from tgbot.finite_states.materials import MaterialFSM


async def add_material_message(message: types.Message, state: FSMContext) -> None:
    await message.delete()
    user = await get_user(message.from_user.id)
    perms = await get_group_and_perms(user.id)
    if 'material.add_personal' in perms.get("permissions"):
        await message.answer(text="Отправьте мне материалы для быстрого добавления, после чего нажмите кнопку 'Отмена' "
                                  "для выхода из инструмента\nПо умолчанию 1 сообщение - 1 материал. "
                                  "Название материала будет взято из названия файла или сгенерировано автоматически. "
                                  "Описанием будет подпись к объекту. В случае текстового сообщения будет добавлен "
                                  "текстовый материал. Будьте осторожны с этим инструментом. Для массового добавления "
                                  "материалов лучше будет использовать парсер",
                             reply_markup=cancel_keyboard)
        await state.set_state(MaterialFSM.material_add)
    else:
        await message.answer(text="У вас нет прав на добавление материалов")


def add_material_generate_success_message(material: Material) -> dict:
    return {
        "text": f'Материал успешно загружен!\n'
                f'Наименование: {material.name}\n'
                f'Описание: {material.description}\n'
                f'ID: {material.id}\n',
        "reply_markup": None
    }


async def add_material_add(message: types.Message, state: FSMContext,  set_to: str = None, obj_id: int = None) -> None:
    async def set_to_obj(mat_id):
        if set_to == "statehw":
            statedata = await state.get_data()
            statedata["new_hw"]["materials"].append(mat_id)
            await state.update_data(statedata)

    def get_path(file_format: str) -> dict:
        file_path_db = os.path.join("materials", f'{msgdata.get("name")}.{file_format}')
        file_path = os.path.join(MEDIA_ROOT, file_path_db)
        return {
            "file_path_db": file_path_db,
            "file_path": file_path
        }

    async def material_exists_validator() -> dict:
        mat = await Material.objects.filter(tg_url=msgdata.get('tg_url')).afirst() if msgdata.get('tg_url') else None
        if not mat:
            mat_name = await Material.objects.filter(name=msgdata.get('name')).afirst()
            if not mat_name:
                return {"status": True}
            else:
                counter = 1
                while True:
                    new_name = f"{msgdata.get('name')}({counter})"
                    mat_name_check = await Material.objects.filter(name=new_name).afirst()
                    if mat_name_check:
                        counter += 1
                    else:
                        msgdata['name'] = new_name
                        return {"status": True}

        else:
            await statusmessage.edit_text(
                text=f"Материал не добавлен, так как уже существует\n"
                     f"Наименование: {mat.name}\n"
                     f"ID: {mat.id}"
            )
            return {"status": False,
                    "material": mat}

    async def animation_convert():
        await statusmessage.edit_text("Идёт конвертация")
        file_format = msgdata.get('format')
        path = os.path.join(MEDIA_ROOT, "materials", f"{msgdata.get('name')}.{file_format}")
        await bot.download(file=msgdata.get('tg_url'),
                           destination=path)
        if file_format != 'gif':
            video = cv2.VideoCapture(path)
            frames = []
            while True:
                ret, frame = video.read()
                if not ret:
                    break
                frames.append(frame)
            for i in range(len(frames)):
                cv2.imwrite(f"{msgdata.get('name')}{i}.png", frames[i])
            frame_images = [Image.open(f"{msgdata.get('name')}{i}.png") for i in range(len(frames))]
            frame_images[0].save(f"{MEDIA_ROOT}/materials/{msgdata.get('name')}.gif",
                                 format='GIF',
                                 append_images=frame_images[1:],
                                 save_all=True,
                                 duration=100,
                                 loop=0)
            for i in range(len(frames)):
                os.remove(f"{msgdata.get('name')}{i}.png")
            return get_path("gif")

    async def download_and_add(paths, redownload=True):
        await statusmessage.edit_text(text="Начинаю загрузку..")
        if redownload:
            await bot.download(file=msgdata.get('tg_url'),
                               destination=paths.get("file_path"))
        new_mat = await Material.objects.acreate(
            name=msgdata.get("name")[:200],
            description=msgdata.get("description"),
            file=paths.get("file_path_db"),
            owner=owner,
            tg_url=msgdata.get('tg_url'),
            type=2
        )
        cat = await MaterialCategory.objects.aget_or_create(name="Импорт из TG")
        await new_mat.category.aset([cat[0]])
        await new_mat.asave()
        await statusmessage.edit_text(
            **add_material_generate_success_message(new_mat)
        )
        if set_to:
            await set_to_obj(new_mat.id)


    statusmessage = await message.reply("Начинаю загрузку материала..")
    msgdata = add_material_validate(message)
    owner = await get_user(message.from_user.id)
    if msgdata.get("type") == "text":
        paths = get_path("txt")
        await statusmessage.edit_text("Определён текстовый материал")
        exists_validation = await material_exists_validator()
        if exists_validation.get("status"):
            with open(paths.get("file_path"), "w", encoding="utf-8") as file:
                file.write(msgdata.get("text"))
            try:
                new_mat = await Material.objects.acreate(
                    name=msgdata.get("name")[:200],
                    description=msgdata.get("description"),
                    file=paths.get("file_path_db"),
                    owner=owner,
                    type=2
                )
                await statusmessage.edit_text(
                    **add_material_generate_success_message(new_mat)
                )
                if set_to:
                    await set_to_obj(new_mat.id)
            except Exception as e:
                await statusmessage.edit_text(
                    text=f'Произошла ошибка при добавлении материала:\n{e}'
                )
        else:
            if set_to:
                await set_to_obj(exists_validation.get("material").id)
    elif msgdata.get("type") == "voice":
        await statusmessage.edit_text("Определён тип голосового сообщения")
        paths = get_path("ogg")
        exists_validation = await material_exists_validator()
        if exists_validation.get("status"):
            try:
                await download_and_add(paths)
            except Exception as e:
                await statusmessage.edit_text(
                    text=f'Произошла ошибка при добавлении материала:\n{e}'
                )
        else:
            if set_to:
                await set_to_obj(exists_validation.get("material").id)
    elif msgdata.get("type") == "photo":
        await statusmessage.edit_text("Определён тип изображения")
        paths = get_path("png")
        exists_validation = await material_exists_validator()
        if exists_validation.get("status"):
            try:
                await download_and_add(paths)
            except Exception as e:
                await statusmessage.edit_text(
                    text=f'Произошла ошибка при добавлении материала:\n{e}'
                )
        else:
            if set_to:
                await set_to_obj(exists_validation.get("material").id)
    elif msgdata.get("type") == "audio":
        await statusmessage.edit_text("Определён тип аудиозаписи")
        paths = get_path("m4a")
        exists_validation = await material_exists_validator()
        if exists_validation.get("status"):
            try:
                await download_and_add(paths)
            except Exception as e:
                await statusmessage.edit_text(
                    text=f'Произошла ошибка при добавлении материала:\n{e}'
                )
        else:
            if set_to:
                await set_to_obj(exists_validation.get("material").id)
    elif msgdata.get("type") == "animation":
        await statusmessage.edit_text("Определён тип анимации")
        exists_validation = await material_exists_validator()
        if exists_validation.get("status"):
            try:
                paths = await animation_convert()
                await download_and_add(paths, False)
            except Exception as e:
                await statusmessage.edit_text(
                    text=f'Произошла ошибка при добавлении материала:\n{e}'
                )
        else:
            if set_to:
                await set_to_obj(exists_validation.get("material").id)
    elif msgdata.get("type") == "document":
        await statusmessage.edit_text("Определён тип документа")
        paths = get_path(msgdata.get("format"))
        exists_validation = await material_exists_validator()
        if exists_validation.get("status"):
            try:
                await download_and_add(paths)
            except Exception as e:
                await statusmessage.edit_text(
                    text=f'Произошла ошибка при добавлении материала:\n{e}'
                )
        else:
            if set_to:
                await set_to_obj(exists_validation.get("material").id)
    elif msgdata.get("type") == "video":
        await statusmessage.edit_text("Определён тип видеозаписи")
        paths = get_path("webm")
        exists_validation = await material_exists_validator()
        if exists_validation.get("status"):
            try:
                await download_and_add(paths)
            except Exception as e:
                await statusmessage.edit_text(
                    text=f'Произошла ошибка при добавлении материала:\n{e}'
                )
        else:
            if set_to:
                await set_to_obj(exists_validation.get("material").id)
    elif msgdata.get("type") == "unsupported":
        await statusmessage.edit_text("Данный документ не может быть загружен, так как формат не поддерживается")


def add_material_validate(message: types.Message) -> dict:
    dt = f'Импорт из Telegram {datetime.now().strftime("%d.%m.%Y %H:%M")}'
    description = message.caption if message.caption else ''
    data = {
        "type": None,
        "tg_url": None,
        "name": None,
        "description": None,
        "text": None
    }
    if message.text:
        data["type"] = "text"
        data["text"] = message.text
        data["name"] = " ".join(message.text.split(" ")[:10])
        data["description"] = dt
    if message.voice:
        data["type"] = "voice"
        data["name"] = f'Голосовое сообщение TG {message.message_id}'
        data["description"] = dt
        data["tg_url"] = message.voice.file_id
    if message.photo:
        data["type"] = "photo"
        data["name"] = f'Изображение TG {message.message_id}'
        data["description"] = f'{description}\n{dt}'
        data["tg_url"] = message.photo[-1].file_id
    if message.audio:
        file_name = message.audio.file_name
        data["type"] = "audio"
        data["name"] = file_name.split(".")[0] if file_name else f'Аудиозапись TG {message.message_id}'
        data["description"] = f'{description}\n{dt}'
        data["tg_url"] = message.audio.file_id
    if message.animation:
        file_name = message.animation.file_name
        data["type"] = "animation"
        data["name"] = file_name.split(".")[0] if file_name else f'Анимация TG {message.message_id}'
        data["description"] = f'{description}\n{dt}'
        data["tg_url"] = message.animation.file_id
        data["format"] = message.animation.file_name.split(".")[-1] if message.animation.file_name else "mp4"
    if message.document:
        if not message.animation:
            file_type = get_type(message.document.file_name.split(".")[-1])
            if file_type != "unsupported":
                file_name = message.document.file_name
                data["type"] = "document"
                data["name"] = file_name.split(".")[0] if file_name else f'Документ TG {message.message_id}'
                data["description"] = f'{description}\n{dt}'
                data["tg_url"] = message.document.file_id
                data["format"] = file_name.split(".")[-1]
            else:
                data["type"] = "unsupported"
    if message.video:
        file_name = message.video.file_name
        data["type"] = "video"
        data["name"] = file_name.split(".")[0] if file_name else f'Видео TG {message.message_id}'
        data["description"] = f'{description}\n{dt}'
        data["tg_url"] = message.video.file_id
    if data.get("name"):
        validated_name = data.get("name")
        for symbol in ["<", ">", ":", '"', "/", "\\", "|", "?", "*", "\n"]:
            if symbol in validated_name:
                validated_name = validated_name.replace(symbol, "")
        data['name'] = validated_name[:75]
    return data
