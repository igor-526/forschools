from aiogram import types, Router, F
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext

from tgbot.finite_states.chats import ChatsFSM
from tgbot.finite_states.menu import MenuFSM
from tgbot.funcs.fileutils import add_files_to_state
from tgbot.funcs.materials import get_user_materials
from tgbot.funcs.menu import send_menu
from tgbot.funcs.homeworks import show_homework_queryset
from tgbot.funcs.chats import chats_show
from tgbot.keyboards.default import message_typing_keyboard, cancel_keyboard

router = Router(name=__name__)


@router.message(StateFilter(MenuFSM.main_menu),
                F.text == "Материалы")
async def h_mainmenu_materials(message: types.Message, state: FSMContext) -> None:
    await get_user_materials(message, state)


@router.message(StateFilter(MenuFSM.main_menu),
                F.text == "Домашние задания")
async def h_mainmenu_homeworks(message: types.Message) -> None:
    await show_homework_queryset(message)


@router.message(StateFilter(MenuFSM.main_menu),
                F.text == "Занятия")
async def h_mainmenu_lessons(message: types.Message) -> None:
    xx = await message.answer(text="Функиция пока не реализована. "
                                   "Тут у ученика будут данные о предстоящих и нескольких прошедших занятиях. "
                                   "Это даст возможность узнать время и дату занятия без уведомления. "
                                   "Преподаватели же смогут увидеть своё расписание на сегодняшний и завтрашний день. "
                                   "Также возможность отметить присутствующих и отсутствующих учеников")
    print(xx)


@router.message(StateFilter(MenuFSM.main_menu),
                F.text.contains("Чаты"))
async def h_mainmenu_chats(message: types.Message) -> None:
    await chats_show(message)
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
        await message.answer(text="При необходимости отправьте ещё сообщения. "
                             "После выбора пользователя сообщение будет доставлено",
                             reply_markup=cancel_keyboard)
        await chats_show(message, read=False)
        await state.set_state(ChatsFSM.send_message)
    await add_files_to_state(message, state)

