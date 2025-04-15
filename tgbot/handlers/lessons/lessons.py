from aiogram import types, Router, F
from aiogram.types import CallbackQuery
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from tgbot.finite_states.lessons import LessonsFSM
from tgbot.funcs.lessons import lessons_search_users, f_lessons_show_place_access_info
from tgbot.keyboards.callbacks.lessons import LessonPlaceCallback
from tgbot.funcs.menu import send_menu

router = Router(name=__name__)


@router.message(StateFilter(LessonsFSM.user_search), F.text == "Отмена")
async def h_lessons_menu(message: types.Message, state: FSMContext) -> None:
    await send_menu(message.from_user.id, state)


@router.message(StateFilter(LessonsFSM.user_search))
async def h_lessons_users_search(message: types.Message, state: FSMContext) -> None:
    await lessons_search_users(message, state)


@router.callback_query(LessonPlaceCallback.filter())
async def h_lessons_place_show_callback(callback: CallbackQuery,
                                        callback_data: LessonPlaceCallback) -> None:
    await f_lessons_show_place_access_info(callback_data.lesson_id, callback.from_user.id)
