from aiogram import types, Router, F
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from tgbot.finite_states.chats import ChatsFSM
from tgbot.funcs.lessons import lessons_get_schedule
from tgbot.funcs.materials import get_user_materials
from tgbot.funcs.homeworks import homeworks_send_menu
from tgbot.funcs.chats import chats_show, chats_type_message


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
async def h_mainmenu_lessons(message: types.Message, state: FSMContext) -> None:
    await lessons_get_schedule(message.from_user.id, state)


@router.message(StateFilter(None),
                F.text.contains("Сообщения"))
async def h_mainmenu_chats(message: types.Message, state: FSMContext) -> None:
    await chats_show(message, state)
    await message.delete()


@router.message(StateFilter(None),
                F.text == "Настройки")
async def h_mainmenu_settings(message: types.Message) -> None:
    await message.answer(text="Функция пока не реализована. Тут будет возможность отвязать Telegram от профиля "
                              "на портале, изменить свои данные. Может быть настроить уведомления (задел на будущее "
                              "как идея - привязка нескольких телеграмов к одному аккаунту на портале. Например, для "
                              "получения уведомлений родителями)")


@router.message(StateFilter(None))
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

