from aiogram import types, Router, F
from aiogram.types import CallbackQuery
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext

from profile_management.models import NewUser
from tgbot.finite_states.lessons import LessonsFSM
from tgbot.funcs.lessons import lessons_get_schedule, lessons_search_users
from tgbot.keyboards.callbacks.lessons import LessonScheduleListCallback
from tgbot.funcs.menu import send_menu

router = Router(name=__name__)


@router.message(StateFilter(LessonsFSM.user_search), F.text == "Отмена")
async def h_lessons_menu(message: types.Message, state: FSMContext) -> None:
    await send_menu(message.from_user.id, state)


@router.message(StateFilter(LessonsFSM.user_search))
async def h_lessons_users_search(message: types.Message, state: FSMContext) -> None:
    await lessons_search_users(message, state)


@router.callback_query(LessonScheduleListCallback.filter())
async def h_lessons_user_show_callback(callback: CallbackQuery,
                                       callback_data: LessonScheduleListCallback,
                                       state: FSMContext) -> None:
    user = await NewUser.objects.aget(pk=callback_data.user_id)
    await lessons_get_schedule(callback.from_user.id, state, user)
