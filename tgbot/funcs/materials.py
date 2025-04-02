from datetime import timedelta, datetime, timezone
from aiogram.exceptions import TelegramBadRequest
from aiogram.types import CallbackQuery, FSInputFile
from django.db.models import Q
from homework.models import Homework
from material.utils.get_for_listener import aget_materials_for_listener, aget_materials_for_listener_next
from material.models import Material, MaterialCategory, MaterialLevel
from profile_management.models import Telegram
from tgbot.create_bot import bot
from tgbot.keyboards.callbacks.material import MaterialItemCallback, MaterialItemSendTgCallback
from tgbot.utils import get_group_and_perms, get_user
from aiogram.fsm.context import FSMContext
from aiogram import types
from tgbot.keyboards.materials import (get_keyboard_materials,
                                       get_keyboard_categories,
                                       get_keyboard_types,
                                       get_keyboard_query_user,
                                       get_keyboard_levels,
                                       get_keyboard_material_item,
                                       get_keyboard_tg_users,
                                       get_show_key)
from tgbot.finite_states.materials import MaterialFSM
from material.utils.get_type import get_type
from user_logs.models import UserLog


async def send_material_item(tg_id: int, material: Material, protect=False, meta=True, delete_settings=None) -> None:
    def generate_material_message() -> str:
        if meta:
            msg_text = f"<b>{material.name}</b>"
        else:
            msg_text = ""
        if material.description:
            msg_text += f"\n{material.description}"
        return msg_text

    file = material.tg_url if material.tg_url else FSInputFile(path=material.file.path)
    mat_type = get_type(material.file.name.split(".")[-1])
    user = await get_user(tg_id)
    perms = await get_group_and_perms(user.id)
    send_tg = 'material.send_telegram' in perms.get('permissions')
    file_id = None
    all_text = generate_material_message()
    caption = all_text[:1024]
    other_text = all_text[1024:5120]
    if mat_type == "image_formats":
        try:
            message = await bot.send_photo(chat_id=tg_id,
                                           photo=file,
                                           caption=caption,
                                           reply_markup=get_keyboard_material_item(material, send_tg, delete_settings),
                                           protect_content=protect)
            file_id = message.photo[-1].file_id
        except TelegramBadRequest:
            message = await bot.send_document(chat_id=tg_id,
                                              document=file,
                                              caption=caption,
                                              reply_markup=get_keyboard_material_item(material, send_tg, delete_settings),
                                              protect_content=protect)
            file_id = message.document.file_id
    elif mat_type == "animation_formats":
        message = await bot.send_animation(chat_id=tg_id,
                                           caption=caption,
                                           animation=file,
                                           reply_markup=get_keyboard_material_item(material, send_tg, delete_settings),
                                           protect_content=protect)
        if message.animation:
            file_id = message.animation.file_id
        else:
            file_id = message.document.file_id
    elif mat_type in ["pdf_formats", "word_formats", "archive_formats", "presentation_formats"]:
        message = await bot.send_document(chat_id=tg_id,
                                          document=file,
                                          caption=caption,
                                          reply_markup=get_keyboard_material_item(material, send_tg, delete_settings),
                                          protect_content=protect)
        file_id = message.document.file_id
    elif mat_type == "video_formats":
        message = await bot.send_video(chat_id=tg_id,
                                       video=file,
                                       caption=caption,
                                       reply_markup=get_keyboard_material_item(material, send_tg, delete_settings),
                                       protect_content=protect)
        file_id = message.video.file_id
    elif mat_type == "audio_formats":
        message = await bot.send_audio(chat_id=tg_id,
                                       audio=file,
                                       caption=caption,
                                       reply_markup=get_keyboard_material_item(material, send_tg, delete_settings),
                                       protect_content=protect)
        file_id = message.audio.file_id if message.audio else message.document.file_id
    elif mat_type == "voice_formats":
        message = await bot.send_voice(chat_id=tg_id,
                                       voice=file,
                                       caption=caption,
                                       reply_markup=get_keyboard_material_item(material, send_tg, delete_settings),
                                       protect_content=protect)
        file_id = message.voice.file_id
    elif mat_type == "text_formats":
        try:
            with open(material.file.path, "r", encoding="utf-16") as textfile:
                await bot.send_message(chat_id=tg_id,
                                       text=textfile.read()[:4096],
                                       reply_markup=get_keyboard_material_item(material, send_tg, delete_settings),
                                       protect_content=protect)
        except (UnicodeDecodeError, UnicodeError):
            with open(material.file.path, "r", encoding="utf-8") as textfile:
                await bot.send_message(chat_id=tg_id,
                                       text=textfile.read()[:4096],
                                       reply_markup=get_keyboard_material_item(material, send_tg, delete_settings),
                                       protect_content=protect)
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


async def send_material(user_id: list):
    await bot.send_message(chat_id=user_id[0], text="Вам направлен материал")
    return {"errors": {"count": 0, "errors": []}}


async def filter_materials(materials: list[Material], state: FSMContext):
    data = await state.get_data()
    dicted_materials = [{"name": mat.name,
                         "id": mat.id,
                         "cat": [cat.id async for cat in mat.category.all()],
                         "level": [level.id async for level in mat.level.all()],
                         "type": get_type(mat.file.name.split(".")[-1])} for mat in materials]
    cat_id = data.get("cat_id")
    mat_type = data.get("mat_type")
    level_id = data.get("lvl_id")
    if mat_type and mat_type != "all":
        dicted_materials = filter(lambda mat: mat.get("type") == mat_type, dicted_materials)
    if cat_id and cat_id != 0:
        dicted_materials = filter(lambda mat: cat_id in mat.get("cat"), dicted_materials)
    if level_id and level_id != 0:
        dicted_materials = filter(lambda mat: level_id in mat.get("level"), dicted_materials)
    return dicted_materials


async def send_material_query(callback: CallbackQuery, state: FSMContext, materials=None):
    if materials is None:
        user = await get_user(callback.from_user.id)
        perms = await get_group_and_perms(user.id)
        materials = [_ async for _ in Material.objects.filter(type=1, owner=user)]
        if 'material.see_all_general' in perms["permissions"]:
            materials += [_ async for _ in Material.objects.filter(type=2)]
        dicted_materials = await filter_materials(materials, state)
        await callback.message.edit_text(text="Вот что удалось найти:",
                                         reply_markup=get_keyboard_query_user(dicted_materials))
    else:
        pass


async def send_categories(message: types.Message):
    categories = [_ async for _ in MaterialCategory.objects.all()]
    await message.answer("Категории:",
                         reply_markup=get_keyboard_categories(categories))


async def send_levels(callback: CallbackQuery):
    levels = [_ async for _ in MaterialLevel.objects.all()]
    await callback.message.edit_text("Уровень:",
                                     reply_markup=get_keyboard_levels(levels))


async def send_types(callback: CallbackQuery):
    await callback.message.edit_text("Тип:",
                                     reply_markup=get_keyboard_types())


async def navigate_user_materials(callback: CallbackQuery, state: FSMContext, user_id, page):
    perms = await get_group_and_perms(user_id)
    if 'Listener' in perms.get('groups'):
        materials = await aget_materials_for_listener(user_id, page)
        next_materials = await aget_materials_for_listener_next(user_id, page)
        dicted_materials = await filter_materials(materials, state)
        await callback.message.edit_text(text="Вам доступны следующие материалы:",
                                         reply_markup=get_keyboard_query_user(
                                             dicted_materials,
                                             user_id,
                                             page,
                                             next_materials))


async def get_user_materials(message: types.Message, state: FSMContext):
    user = await get_user(message.from_user.id)
    perms = await get_group_and_perms(user.id)
    if 'Listener' in perms.get('groups'):
        materials = await aget_materials_for_listener(user.id, 1)
        next_materials = await aget_materials_for_listener_next(user.id, 1)
        dicted_materials = await filter_materials(materials, state)
        await message.delete()
        await message.answer(text="Вам доступны следующие материалы:",
                             reply_markup=get_keyboard_query_user(dicted_materials, user.id, 1, next_materials))
    else:
        await message.answer("Выберите категорию или напишите фразу для поиска:",
                             reply_markup=get_keyboard_materials(add_mat=True))
        await state.set_state(MaterialFSM.material_search)
        await send_categories(message)


async def send_tg_users(callback: CallbackQuery, state: FSMContext, mat_id) -> None:
    tg_users = [_ async for _ in Telegram.objects.select_related("user").all()]
    await bot.send_message(chat_id=callback.message.chat.id,
                           text="Выберите пользователя: ",
                           reply_markup=get_keyboard_tg_users(tg_users, mat_id))


async def send_material_to_tg(callback: CallbackQuery, callback_data: MaterialItemSendTgCallback) -> None:
    try:
        await bot.send_message(chat_id=callback_data.tg_id,
                               text=f"Вам направлен материал",
                               reply_markup=get_show_key(callback_data.mat_id))
        await callback.message.edit_text("Материал успешно доставлен")
    except Exception as e:
        await callback.answer("Произошла ошибка, материал не доставлен")


async def search_materials(message: types.Message, state: FSMContext) -> None:
    user = await get_user(message.from_user.id)
    query = [_ async for _ in Material.objects.filter(
        Q(visible=True, name__iregex=message.text, type=2) |
        Q(visible=True, name__iregex=message.text, type=1, owner=user)
    )]
    await message.delete()
    dicted_materials = await filter_materials(query, state)
    await message.answer(text=f"Вот что удалось найти по запросу '{message.text}'",
                         reply_markup=get_keyboard_query_user(dicted_materials))


async def delete_material_from_hw(callback: CallbackQuery, callback_data: MaterialItemCallback, state: FSMContext):
    if callback.message.date + timedelta(hours=1) > datetime.now(tz=timezone.utc):
        if callback_data.obj_id:
            homework = await Homework.objects.filter(id=callback_data.obj_id).afirst()
            if homework:
                hw_group = await homework.homeworkgroups_set.afirst()
                if hw_group:
                    hws = [_ async for _ in
                           hw_group.homeworks.select_related("teacher").select_related("listener").all()]
                else:
                    hws = [homework]

                for hw in hws:
                    await hw.materials.aset([hw.id async for hw in hw.materials.all().exclude(id=callback_data.mat_id)])
                    lesson = await hw.aget_lesson()
                    plan = await lesson.aget_learning_plan() if lesson else None
                    if plan:
                        user = await get_user(callback.from_user.id)
                        mat = await Material.objects.filter(id=callback_data.mat_id).afirst()
                        ul = await UserLog.objects.acreate(log_type=4,
                                                      color="danger",
                                                      learning_plan=plan,
                                                      title=f"Из домашнего задания удалён материал",
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
                                                      user=user)
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
        await callback.answer("Превышен таймаут. Вызовите материал ещё раз и повторите попытку")
    await callback.message.delete()
