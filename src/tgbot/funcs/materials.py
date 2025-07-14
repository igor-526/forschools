from datetime import datetime, timedelta, timezone

from aiogram.exceptions import TelegramBadRequest
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, FSInputFile

from homework.models import Homework

from material.models import Material
from material.utils import get_type_by_ext

from tgbot.create_bot import bot
from tgbot.keyboards.callbacks.material import MaterialItemCallback
from tgbot.keyboards.materials import get_keyboard_material_item
from tgbot.utils import get_user

from user_logs.models import UserLog


async def send_material_item(tg_id: int, material: Material,
                             protect=False, meta=True,
                             delete_settings=None) -> None:
    def generate_material_message() -> str:
        if meta:
            msg_text = f"<b>{material.name}</b>"
        else:
            msg_text = ""
        if material.description:
            msg_text += f"\n{material.description}"
        return msg_text

    file = material.tg_url if material.tg_url \
        else FSInputFile(path=material.file.path)
    mat_type = get_type_by_ext(material.file.name.split(".")[-1])
    file_id = None
    all_text = generate_material_message()
    caption = all_text[:1024]
    other_text = all_text[1024:5120]
    if mat_type == "image_formats":
        try:
            message = await bot.send_photo(
                chat_id=tg_id,
                photo=file,
                caption=caption,
                reply_markup=get_keyboard_material_item(
                    material, delete_settings),
                protect_content=protect
            )
            file_id = message.photo[-1].file_id if message.photo[-1] else None
        except TelegramBadRequest:
            message = await bot.send_document(
                chat_id=tg_id,
                document=file,
                caption=caption,
                reply_markup=get_keyboard_material_item(
                    material, delete_settings),
                protect_content=protect
            )
            file_id = message.document.file_id if message.document else None
    elif mat_type == "animation_formats":
        message = await bot.send_animation(
            chat_id=tg_id,
            caption=caption,
            animation=file,
            reply_markup=get_keyboard_material_item(material, delete_settings),
            protect_content=protect
        )
        if message.animation:
            file_id = message.animation.file_id if message.animation else None
        else:
            file_id = message.document.file_id if message.document else None
    elif mat_type in ["pdf_formats", "word_formats",
                      "archive_formats", "presentation_formats"]:
        message = await bot.send_document(
            chat_id=tg_id,
            document=file,
            caption=caption,
            reply_markup=get_keyboard_material_item(material, delete_settings),
            protect_content=protect
        )
        file_id = message.document.file_id if message.document else None
    elif mat_type == "video_formats":
        message = await bot.send_video(
            chat_id=tg_id,
            video=file,
            caption=caption,
            reply_markup=get_keyboard_material_item(material, delete_settings),
            protect_content=protect
        )
        file_id = message.video.file_id if message.video else None
    elif mat_type == "audio_formats":
        message = await bot.send_audio(
            chat_id=tg_id,
            audio=file,
            caption=caption,
            reply_markup=get_keyboard_material_item(material, delete_settings),
            protect_content=protect
        )
        if message.audio and message.audio.file_id:
            file_id = message.audio.file_id
        elif message.document and message.document.file_id:
            file_id = message.document.file_id
        else:
            file_id = None
    elif mat_type == "voice_formats":
        message = await bot.send_voice(
            chat_id=tg_id,
            voice=file,
            caption=caption,
            reply_markup=get_keyboard_material_item(material, delete_settings),
            protect_content=protect
        )
        file_id = message.voice.file_id if message.voice else None
    elif mat_type == "text_formats":
        try:
            with open(material.file.path, "r", encoding="utf-16") as textfile:
                await bot.send_message(
                    chat_id=tg_id,
                    text=textfile.read()[:4096],
                    reply_markup=get_keyboard_material_item(
                        material, delete_settings),
                    protect_content=protect
                )
        except (UnicodeDecodeError, UnicodeError):
            with open(material.file.path, "r", encoding="utf-8") as textfile:
                await bot.send_message(
                    chat_id=tg_id,
                    text=textfile.read()[:4096],
                    reply_markup=get_keyboard_material_item(
                        material, delete_settings),
                    protect_content=protect
                )
    if other_text:
        await bot.send_message(chat_id=tg_id,
                               text=other_text)
    if not material.tg_url and file_id:
        material.tg_url = file_id
        await material.asave()


async def show_material_item(callback: CallbackQuery, mat_id):
    material = await Material.objects.filter(id=mat_id).afirst()
    if material:
        await send_material_item(callback.from_user.id, material)
    else:
        await callback.answer(text="Произошла ошибка. Материал не существует")


async def delete_material_from_hw(callback: CallbackQuery,
                                  callback_data: MaterialItemCallback,
                                  state: FSMContext):
    if (callback.message.date + timedelta(hours=1) >
            datetime.now(tz=timezone.utc)):
        if callback_data.obj_id:
            homework = await Homework.objects.filter(
                id=callback_data.obj_id).afirst()
            if homework:
                hw_group = await homework.homeworkgroups_set.afirst()
                if hw_group:
                    hws = [
                        _ async for _ in
                        hw_group.homeworks.select_related(
                            "teacher", "listener").all()
                    ]
                else:
                    hws = [homework]

                for hw in hws:
                    await hw.materials.aset(
                        [hw.id async for hw in
                         hw.materials.all().exclude(id=callback_data.mat_id)]
                    )
                    lesson = await hw.aget_lesson()
                    plan = await lesson.aget_learning_plan() \
                        if lesson else None
                    if plan:
                        user = await get_user(callback.from_user.id)
                        mat = await Material.objects.filter(
                            id=callback_data.mat_id).afirst()
                        ul = await UserLog.objects.acreate(
                            log_type=4,
                            color="danger",
                            learning_plan=plan,
                            title="Из домашнего задания удалён материал",
                            content={
                                "list": [{
                                    "name": "Наименование занятия",
                                    "val": lesson.name
                                },
                                    {
                                        "name": "Дата занятия",
                                        "val": lesson.date.strftime("%d.%m.%Y")
                                    }
                                ],
                                "text": []
                            },
                            buttons=[{"inner": "ДЗ",
                                      "href": f"/homeworks/{hw.id}"},
                                     {"inner": "Занятие",
                                      "href": f"/lessons/{lesson.id}"}],
                            user=user
                        )
                        await ul.materials_db.aadd(mat.id)
                await callback.answer("Материала больше нет в ДЗ")
            else:
                await callback.answer("Ошибка. Домашнее задание не найдено")
        else:
            sd = await state.get_data()
            if sd.get("new_hw") and sd.get("new_hw").get("materials"):
                sd['new_hw']['materials'].remove(callback_data.mat_id)
                await state.set_data(sd)
                await callback.answer("Материала больше нет в ДЗ")
            else:
                await callback.answer("Ошибка. Домашнее задание не найдено")

    else:
        await callback.answer("Превышен таймаут. Вызовите материал ещё раз "
                              "и повторите попытку")
    await callback.message.delete()
