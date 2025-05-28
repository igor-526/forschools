import datetime

from aiogram import types, Router, F
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from tgbot.finite_states.chats import ChatsFSM
from tgbot.funcs.lessons import lessons_get_schedule
from tgbot.funcs.materials import get_user_materials
from tgbot.funcs.homeworks.homeworks import homeworks_send_menu
from tgbot.funcs.chats import chats_show, chats_type_message
from tgbot.funcs.multiuser import f_multiuser_generate_message
from tgbot.funcs.settings import generate_settings_message
from tgbot.keyboards.menu_keyboard import get_platform_button

router = Router(name=__name__)


@router.message(StateFilter(None),
                F.text == "Материалы")
async def h_mainmenu_materials(message: types.Message, state: FSMContext) -> None:
    await get_user_materials(message, state)


@router.message(StateFilter(None),
                F.text == "Домашние задания")
async def h_mainmenu_homeworks(message: types.Message, state: FSMContext) -> None:
    await homeworks_send_menu(message, state)


@router.message(StateFilter(None),
                F.text == "Расписание")
async def h_mainmenu_lessons(message: types.Message) -> None:
    await lessons_get_schedule(message)


@router.message(StateFilter(None),
                F.text.contains("История сообщений"))
async def h_mainmenu_chats(message: types.Message, state: FSMContext) -> None:
    await chats_show(message, state)
    await message.delete()


@router.message(StateFilter(None),
                F.text == "Настройки")
async def h_mainmenu_settings(message: types.Message) -> None:
    await generate_settings_message(message)


@router.message(StateFilter(None),
                F.text == "Сменить аккаунт")
async def h_mainmenu_multiuser(message: types.Message) -> None:
    await f_multiuser_generate_message(message)


@router.message(StateFilter(None),
                F.text == "Платформа")
async def h_mainmenu_platform(message: types.Message) -> None:
    await message.answer(text="Нажмите на кнопку для перехода на платформу",
                         reply_markup=await get_platform_button(message.from_user.id))


@router.message(StateFilter(None),
                F.media_group_id != None)
async def h_mainmenu_message_media_group(message: types.Message, state: FSMContext, media_events=[]):
    data = await state.get_data()
    if not data.get("files") and not data.get("text"):
        await state.set_data({'files': [],
                              'comment': []})
    await chats_type_message(media_events, state)


@router.message(StateFilter(None))
async def h_mainmenu_message(message: types.Message, state: FSMContext) -> None:
    data = await state.get_data()
    if not data.get("files") and not data.get("comment"):
        await state.set_data({'files': [],
                              'comment': [],
                              'start_time': datetime.datetime.now().strftime('%d.%m.%YT%H:%M')})
    messages = [message]
    if message.reply_to_message:
        messages.append(message.reply_to_message)
    await state.set_state(ChatsFSM.send_message)
    await chats_type_message(messages, state)
