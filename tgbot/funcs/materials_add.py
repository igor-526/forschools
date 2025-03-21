import os.path
from datetime import datetime
from PIL import Image
import cv2
from dls.settings import MEDIA_ROOT
from material.models import Material, File
from material.utils.get_type import get_type
from profile_management.models import NewUser
from tgbot.create_bot import bot
from tgbot.utils import get_group_and_perms, get_user, get_tg_note
from aiogram.fsm.context import FSMContext
from aiogram import types
from tgbot.keyboards.default import cancel_keyboard
from tgbot.finite_states.materials import MaterialFSM
from tgbot.middlewares import log_error


class FileParser:
    material_message: types.Message = None
    status_message: types.Message = None
    mode: str
    ignore_text: bool
    file_type: str = None
    file_format: str = None
    file_name: str = None
    file_description: str = None
    file_id_tg = None
    file_owner: NewUser = None
    file_path_db: str = None
    file_path: str = None
    file_path_non_ext: str = None
    ready_file: File = None
    ready_material: Material = None
    success_text: str = None
    reply_markup = None

    def __init__(self,
                 message: types.Message,
                 mode: str = "material",
                 success_text: str = "Материал успешно загружен!",
                 reply_markup=None,
                 add_time_stamp: bool = False,
                 ignore_text: bool = False):
        self.material_message = message
        self.mode = mode
        self.add_time_stamp = add_time_stamp
        self.ignore_text = ignore_text
        self.success_text = success_text
        self.reply_markup = reply_markup
        self.set_file_data()
        if add_time_stamp:
            self.add_timestamp()

    async def update_status_message(self, text: str):
        if self.status_message:
            await self.status_message.edit_text(text=text)
        else:
            self.status_message = await self.material_message.reply(text)

    def add_timestamp(self):
        if self.file_description is not None:
            self.file_description += f'\nИмпорт из Telegram {datetime.now().strftime("%d.%m.%Y %H:%M")}'

    def set_file_data(self):
        if self.material_message.text:
            self.file_description = self.material_message.text
        if self.material_message.caption:
            if self.file_description is None:
                self.file_description = self.material_message.caption
            else:
                self.file_description += f"\n{self.material_message.caption}"

        if self.material_message.text:
            self.file_type = "text"
            self.file_description = self.material_message.text
            self.file_name = " ".join(self.material_message.text.split(" ")[:10])
            self.file_format = "txt"

        if self.material_message.voice:
            self.file_type = "voice"
            self.file_name = f'Голосовое сообщение TG {self.material_message.message_id}'
            self.file_id_tg = self.material_message.voice.file_id
            self.file_format = "ogg"

        if self.material_message.photo:
            self.file_type = "photo"
            self.file_name = f'Изображение TG {self.material_message.message_id}'
            self.file_id_tg = self.material_message.photo[-1].file_id
            self.file_format = "png"

        if self.material_message.audio:
            tg_file_name = self.material_message.audio.file_name
            self.file_type = "audio"
            self.file_name = tg_file_name.split(".")[0] if tg_file_name else (f'Аудиозапись TG '
                                                                              f'{self.material_message.message_id}')
            self.file_id_tg = self.material_message.audio.file_id
            self.file_format = "m4a"

        if self.material_message.animation:
            self.file_type = "animation"
            self.file_name = (f'Анимация TG '
                              f'{self.material_message.message_id}')
            self.file_id_tg = self.material_message.animation.file_id
            self.file_format = self.material_message.animation.file_name.split(".")[-1] \
                if self.material_message.animation.file_name else "mp4"

        if self.material_message.document:
            if not self.material_message.animation:
                file_type = get_type(self.material_message.document.file_name.split(".")[-1])
                if file_type != "unsupported":
                    file_name = self.material_message.document.file_name
                    self.file_type = "document"
                    self.file_name = file_name.split(".")[0] if file_name else (f'Документ TG '
                                                                                f'{self.material_message.message_id}')
                    self.file_id_tg = self.material_message.document.file_id
                    self.file_format = file_name.split(".")[-1]
                else:
                    self.file_type = "unsupported"

        if self.material_message.video:
            file_name_tg = self.material_message.video.file_name
            self.file_type = "video"
            self.file_name = file_name_tg.split(".")[0] if file_name_tg else (f'Видео TG '
                                                                              f'{self.material_message.message_id}')
            self.file_id_tg = self.material_message.video.file_id
            self.file_format = "webm"

        if self.file_name:
            validated_name = self.file_name
            for symbol in ["<", ">", ":", '"', "/", "\\", "|", "?", "*", "\n"]:
                if symbol in validated_name:
                    validated_name = validated_name.replace(symbol, "")
            self.file_name = validated_name[:75]

    async def validate_exists(self):
        if self.mode == "material":
            model = Material
        elif self.mode == "file":
            model = File
        else:
            return
        mat = await model.objects.filter(tg_url=self.file_id_tg).afirst() if self.file_id_tg else None
        if not mat:
            mat_name = await model.objects.filter(name=self.file_name).aexists()
            if mat_name:
                counter = 1
                while True:
                    new_name = f"{self.file_name[:190]}({counter})"
                    mat_name_exists = await model.objects.filter(name=new_name).aexists()
                    if mat_name_exists:
                        counter += 1
                    else:
                        self.file_name = new_name
                        break
        else:
            if self.mode == "material":
                self.ready_material = mat
            elif self.mode == "file":
                self.ready_file = mat

    async def set_path(self):
        if self.file_type == "text":
            folder_name = "materials" if self.mode == "material" else "files"
            self.file_path_db = os.path.join(folder_name, f'{self.file_name}.{self.file_format}')
            self.file_path = os.path.join(MEDIA_ROOT, folder_name, f'{self.file_name}.{self.file_format}')
        else:
            file = await self.material_message.bot.get_file(file_id=self.file_id_tg)
            self.file_path_db = os.path.join("telegram", *file.file_path.split("/"))
            self.file_path = os.path.join(MEDIA_ROOT, self.file_path_db)

    def generate_success_message(self, meta=False) -> dict:
        msg = {
            "text": self.success_text,
            "reply_markup": self.reply_markup
        }
        if meta:
            msg["text"] += (f'\nНаименование: {self.file_name}\n'
                            f'Описание: {self.file_description}\n')
        return msg

    # async def animation_convert(self):
    #     await self.update_status_message("Идёт конвертация")
    #     if self.file_format != 'gif':
    #         video = cv2.VideoCapture(self.file_path)
    #         frames = []
    #         while True:
    #             ret, frame = video.read()
    #             if not ret:
    #                 break
    #             frames.append(frame)
    #         for i in range(len(frames)):
    #             cv2.imwrite(f"{self.file_name}{i}.png", frames[i])
    #         frame_images = [Image.open(f"{self.file_name}{i}.png") for i in range(len(frames))]
    #         self.file_format = "gif"
    #         self.set_path()
    #         frame_images[0].save(self.file_path,
    #                              format='GIF',
    #                              append_images=frame_images[1:],
    #                              save_all=True,
    #                              duration=100,
    #                              loop=0)
    #         for i in range(len(frames)):
    #             os.remove(f"{self.file_name}{i}.png")

    async def add_material_db(self):
        try:
            query_params = {
                "name": self.file_name[:200],
                "file": self.file_path_db,
                "type": 2,
                "owner": self.file_owner,
                "tg_url": self.file_id_tg,
                "uploaded_at": self.material_message.date
            }
            if not self.ignore_text:
                query_params["description"] = self.file_description
            new_mat = await Material.objects.acreate(**query_params)
            self.ready_material = new_mat
            await self.status_message.delete()
            await self.material_message.reply(**self.generate_success_message())
        except Exception as e:
            await self.update_status_message(f'Произошла ошибка при добавлении материала:\n{e}')

    async def add_file_db(self):
        try:
            query_params = {
                "name": self.file_name[:200],
                "path": self.file_path_db,
                "owner": self.file_owner,
                "tg_url": self.file_id_tg,
                "uploaded_at": self.material_message.date
            }
            if not self.ignore_text:
                query_params["caption"] = self.file_description
            new_mat = await File.objects.acreate(**query_params)
            self.ready_file = new_mat
            await self.status_message.delete()
            await self.material_message.reply(**self.generate_success_message())
        except Exception as e:
            await self.update_status_message(f'Произошла ошибка при добавлении материала:\n{e}')

    async def download(self):

        # try:
        await self.update_status_message("Начинаю загрузку..")
        self.file_owner = await get_user(self.material_message.from_user.id)
        await self.validate_exists()
        if self.ready_file or self.ready_material:
            await self.status_message.delete()
            await self.material_message.reply(**self.generate_success_message())
            return
        await self.set_path()
        if self.file_type == "text":
            await self.update_status_message("Определён текстовый материал")
            if not self.ignore_text:
                with open(self.file_path, "w", encoding="utf-16") as file:
                    file.write(self.file_description)
                if self.mode == "material":
                    await self.add_material_db()
                elif self.mode == "file":
                    await self.add_file_db()
            else:
                await self.material_message.reply(**self.generate_success_message())
                await self.status_message.delete()

        elif self.file_type == "voice":
            await self.update_status_message("Определён тип голосового сообщения")
            if self.mode == "material":
                await self.add_material_db()
            elif self.mode == "file":
                await self.add_file_db()

        if self.file_type == "photo":
            await self.update_status_message("Определён тип изображения")
            if self.mode == "material":
                await self.add_material_db()
            elif self.mode == "file":
                await self.add_file_db()
        elif self.file_type == "audio":
            await self.update_status_message("Определён тип аудиозаписи")
            if self.mode == "material":
                await self.add_material_db()
            elif self.mode == "file":
                await self.add_file_db()

        elif self.file_type == "animation":
            await self.update_status_message("Определён тип анимации")
            if self.mode == "material":
                await self.add_material_db()
            elif self.mode == "file":
                await self.add_file_db()

        elif self.file_type == "document":
            await self.update_status_message("Определён тип документа")
            if self.mode == "material":
                await self.add_material_db()
            elif self.mode == "file":
                await self.add_file_db()

        elif self.file_type == "video":
            await self.update_status_message("Определён тип видеозаписи")
            if self.mode == "material":
                await self.add_material_db()
            elif self.mode == "file":
                await self.add_file_db()

        elif self.file_type == "unsupported":
            await self.update_status_message("\u2757\u2757\u2757Данный документ не может быть загружен, так как "
                                             "формат не поддерживается\u2757\u2757\u2757")

        # except Exception as e:
        #     await log_error(
        #         at=2,
        #         tg_note=await get_tg_note(self.material_message.from_user.id),
        #         event=self.material_message,
        #         exception=e,
        #     )
        #     await self.update_status_message(f'\u2757\u2757\u2757Произошла ошибка при добавлении материала:\n'
        #                                      f'{e}\u2757\u2757\u2757')


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



