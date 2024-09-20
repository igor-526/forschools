from aiogram import types, Router, F
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext

from tgbot.finite_states.chats import ChatsFSM
from tgbot.finite_states.menu import MenuFSM
from tgbot.funcs.fileutils import add_files_to_state
from tgbot.funcs.lessons import lessons_get_schedule
from tgbot.funcs.materials import get_user_materials
from tgbot.funcs.homeworks import show_homework_queryset, homeworks_send_menu
from tgbot.funcs.chats import chats_show, chats_type_message
from tgbot.keyboards.chats import chats_get_users_buttons
from tgbot.keyboards.default import cancel_keyboard, message_typing_keyboard
from tgbot.utils import get_user

router = Router(name=__name__)


@router.message(StateFilter(MenuFSM.main_menu),
                F.text == "Материалы")
async def h_mainmenu_materials(message: types.Message, state: FSMContext) -> None:
    await get_user_materials(message, state)


@router.message(StateFilter(MenuFSM.main_menu),
                F.text == "Домашние задания")
async def h_mainmenu_homeworks(message: types.Message, state: FSMContext) -> None:
    await homeworks_send_menu(message, state)


@router.message(StateFilter(MenuFSM.main_menu),
                F.text == "Расписание")
async def h_mainmenu_lessons(message: types.Message, state: FSMContext) -> None:
    await lessons_get_schedule(message.from_user.id, state)


@router.message(StateFilter(MenuFSM.main_menu),
                F.text.contains("Сообщения"))
async def h_mainmenu_chats(message: types.Message, state: FSMContext) -> None:
    await chats_show(message, state)
    await message.delete()


@router.message(StateFilter(MenuFSM.main_menu),
                F.text == "Настройки")
async def h_mainmenu_settings(message: types.Message) -> None:
    await message.answer(text="Функция пока не реализована. Тут будет возможность отвязать Telegram от профиля "
                              "на портале, изменить свои данные. Может быть настроить уведомления (задел на будущее "
                              "как идея - привязка нескольких телеграмов к одному аккаунту на портале. Например, для "
                              "получения уведомлений родителями)")


@router.message(StateFilter(MenuFSM.main_menu))
async def h_mainmenu_message(message: types.Message, state: FSMContext) -> None:
    data = await state.get_data()
    if not data.get("files"):
        await state.set_data({'files': {
            'text': [],
            'photo': [],
            'voice': [],
            'audio': [],
            'video': [],
            'animation': [],
            'document': [],
        }
        })
    await state.set_state(ChatsFSM.send_message)
    await chats_type_message(message, state)

