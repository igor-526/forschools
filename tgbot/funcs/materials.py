from aiogram.types import CallbackQuery, FSInputFile
from django.db.models import Q
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


def generate_material_message(material: Material) -> str:
    message = f"<b>{material.name}</b>"
    if material.description:
        message += f"\n{material.description}"
    return message


async def send_material_item(tg_id: int, material: Material, protect=False) -> None:
    file = material.tg_url if material.tg_url else FSInputFile(path=material.file.path)
    mat_type = get_type(material.file.name.split(".")[-1])
    user = await get_user(tg_id)
    perms = await get_group_and_perms(user.id)
    send_tg = 'material.send_telegram' in perms.get('permissions')
    file_id = None
    if mat_type == "image_formats":
        message = await bot.send_photo(chat_id=tg_id,
                                       photo=file,
                                       caption=generate_material_message(material),
                                       reply_markup=get_keyboard_material_item(material, send_tg),
                                       protect_content=protect)
        file_id = message.photo[-1].file_id
    elif mat_type == "animation_formats":
        message = await bot.send_animation(chat_id=tg_id,
                                           caption=generate_material_message(material),
                                           animation=file,
                                           reply_markup=get_keyboard_material_item(material, send_tg),
                                           protect_content=protect)
        if message.animation:
            file_id = message.animation.file_id
        else:
            file_id = message.document.file_id
    elif (mat_type == "pdf_formats" or
          mat_type == "archive_formats" or
          mat_type == "presentation_formats"):
        message = await bot.send_document(chat_id=tg_id,
                                          document=file,
                                          caption=generate_material_message(material),
                                          reply_markup=get_keyboard_material_item(material, send_tg),
                                          protect_content=protect)
        file_id = message.document.file_id
    elif mat_type == "video_formats":
        message = await bot.send_video(chat_id=tg_id,
                                       video=file,
                                       caption=generate_material_message(material),
                                       reply_markup=get_keyboard_material_item(material, send_tg),
                                       protect_content=protect)
        file_id = message.video.file_id
    elif mat_type == "audio_formats":
        message = await bot.send_audio(chat_id=tg_id,
                                       audio=file,
                                       caption=generate_material_message(material),
                                       reply_markup=get_keyboard_material_item(material, send_tg),
                                       protect_content=protect)
        file_id = message.audio.file_id
    elif mat_type == "voice_formats":
        message = await bot.send_voice(chat_id=tg_id,
                                       voice=file,
                                       caption=generate_material_message(material),
                                       reply_markup=get_keyboard_material_item(material, send_tg),
                                       protect_content=protect)
        file_id = message.voice.file_id
    elif mat_type == "text_formats":
        with open(material.file.path, "r") as textfile:
            await bot.send_message(chat_id=tg_id,
                                   text=textfile.read(),
                                   reply_markup=get_keyboard_material_item(material, send_tg),
                                   protect_content=protect)
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
        print(e)


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
