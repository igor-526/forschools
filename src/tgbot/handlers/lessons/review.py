from aiogram import F, Router, types
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery

from tgbot.finite_states.lessons import LessonReviewFSM
from tgbot.funcs.lesson.review import (f_lesson_review_ask_field,
                                       f_lesson_review_confirm,
                                       f_lesson_review_set_field,
                                       f_lesson_review_set_passed)
from tgbot.funcs.menu import send_menu
from tgbot.keyboards.callbacks.lessons import LessonFormReviewCallback

router = Router(name=__name__)


@router.callback_query(LessonFormReviewCallback.filter())
async def h_lessons_review_start_callback(
        callback: CallbackQuery,
        callback_data: LessonFormReviewCallback,
        state: FSMContext
) -> None:
    await f_lesson_review_ask_field(
        callback.from_user.id, state, "name",
        "Пожалуйста, введите наименование для занятия (УМК)",
        "Текущее наименование",
        LessonReviewFSM.name, callback_data.lesson_id
    )


@router.message(StateFilter(LessonReviewFSM),
                F.text == "Отмена")
async def h_lessons_review_name_cancel(message: types.Message,
                                       state: FSMContext) -> None:
    await send_menu(message.from_user.id, state)


@router.message(StateFilter(LessonReviewFSM.name),
                F.text == "Далее")
async def h_lessons_review_name_next(message: types.Message,
                                     state: FSMContext) -> None:
    await f_lesson_review_ask_field(
        message.from_user.id, state, "materials",
        "Пожалуйста, введите материалы, использованные во время занятия",
        "Текущие материалы",
        LessonReviewFSM.materials
    )


@router.message(StateFilter(LessonReviewFSM.materials),
                F.text == "Далее")
async def h_lessons_review_materials_next(message: types.Message,
                                          state: FSMContext) -> None:
    await f_lesson_review_ask_field(message.from_user.id, state, "lexis",
                                    "Пожалуйста, введите лексику",
                                    "Текущая лексика",
                                    LessonReviewFSM.lexis)


@router.message(StateFilter(LessonReviewFSM.lexis),
                F.text == "Далее")
async def h_lessons_review_lexis_next(message: types.Message,
                                      state: FSMContext) -> None:
    await f_lesson_review_ask_field(message.from_user.id, state, "grammar",
                                    "Пожалуйста, введите грамматику",
                                    "Текущая грамматика",
                                    LessonReviewFSM.grammar)


@router.message(StateFilter(LessonReviewFSM.grammar),
                F.text == "Далее")
async def h_lessons_review_grammar_next(message: types.Message,
                                        state: FSMContext) -> None:
    await f_lesson_review_ask_field(
        message.from_user.id, state, "note",
        "Пожалуйста, введите примечания по занятию",
        "Текущее примечание",
        LessonReviewFSM.note
    )


@router.message(StateFilter(LessonReviewFSM.note),
                F.text == "Далее")
async def h_lessons_review_note_next(message: types.Message,
                                     state: FSMContext) -> None:
    await f_lesson_review_ask_field(
        message.from_user.id, state, "org",
        "Пожалуйста, введите организационные моменты занятия",
        "Текущие орг. моменты",
        LessonReviewFSM.org
    )


@router.message(StateFilter(LessonReviewFSM.org),
                F.text == "Далее")
async def h_lessons_review_org_next(message: types.Message,
                                    state: FSMContext) -> None:
    await f_lesson_review_confirm(message, state)


@router.message(StateFilter(LessonReviewFSM.materials),
                F.text == "Назад")
async def h_lessons_review_materials_back(message: types.Message,
                                          state: FSMContext) -> None:
    await f_lesson_review_ask_field(
        message.from_user.id, state, "name",
        "Пожалуйста, введите наименование для занятия (УМК)",
        "Текущее наименование",
        LessonReviewFSM.name
    )


@router.message(StateFilter(LessonReviewFSM.lexis),
                F.text == "Назад")
async def h_lessons_review_lexis_back(message: types.Message,
                                      state: FSMContext) -> None:
    await h_lessons_review_name_next(message, state)


@router.message(StateFilter(LessonReviewFSM.grammar),
                F.text == "Назад")
async def h_lessons_review_grammar_back(message: types.Message,
                                        state: FSMContext) -> None:
    await h_lessons_review_materials_next(message, state)


@router.message(StateFilter(LessonReviewFSM.note),
                F.text == "Назад")
async def h_lessons_review_note_back(message: types.Message,
                                     state: FSMContext) -> None:
    await h_lessons_review_lexis_next(message, state)


@router.message(StateFilter(LessonReviewFSM.org),
                F.text == "Назад")
async def h_lessons_review_org_back(message: types.Message,
                                    state: FSMContext) -> None:
    await h_lessons_review_grammar_next(message, state)


@router.message(StateFilter(LessonReviewFSM.name))
async def h_lessons_review_name_set(message: types.Message,
                                    state: FSMContext) -> None:
    validated = await f_lesson_review_set_field(message, state, "name", 200)
    if validated:
        await h_lessons_review_name_next(message, state)


@router.message(StateFilter(LessonReviewFSM.materials))
async def h_lessons_review_materials_set(message: types.Message,
                                         state: FSMContext) -> None:
    validated = await f_lesson_review_set_field(message, state,
                                                "materials", 2000)
    if validated:
        await h_lessons_review_materials_next(message, state)


@router.message(StateFilter(LessonReviewFSM.lexis))
async def h_lessons_review_lexis_set(message: types.Message,
                                     state: FSMContext) -> None:
    validated = await f_lesson_review_set_field(message, state, "lexis", 200)
    if validated:
        await h_lessons_review_lexis_next(message, state)


@router.message(StateFilter(LessonReviewFSM.grammar))
async def h_lessons_review_grammar_set(message: types.Message,
                                       state: FSMContext) -> None:
    validated = await f_lesson_review_set_field(message, state, "grammar", 300)
    if validated:
        await h_lessons_review_grammar_next(message, state)


@router.message(StateFilter(LessonReviewFSM.note))
async def h_lessons_review_note_set(message: types.Message,
                                    state: FSMContext) -> None:
    validated = await f_lesson_review_set_field(message, state, "note", 2000)
    if validated:
        await h_lessons_review_note_next(message, state)


@router.message(StateFilter(LessonReviewFSM.org))
async def h_lessons_review_org_set(message: types.Message,
                                   state: FSMContext) -> None:
    validated = await f_lesson_review_set_field(message, state, "org", 2000)
    if validated:
        await h_lessons_review_org_next(message, state)


@router.message(StateFilter(LessonReviewFSM.confirm))
async def h_lessons_review_confirm_actions(message: types.Message,
                                           state: FSMContext) -> None:
    if message.text == "Подтвердить":
        await f_lesson_review_set_passed(message, state)
    elif message.text == "Изменить наименование":
        await f_lesson_review_ask_field(
            message.from_user.id, state, "name",
            "Пожалуйста, введите наименование для занятия (УМК)",
            "Текущее наименование",
            LessonReviewFSM.name
        )
    elif message.text == "Изменить материалы":
        await h_lessons_review_name_next(message, state)
    elif message.text == "Изменить лексику":
        await h_lessons_review_materials_next(message, state)
    elif message.text == "Изменить грамматику":
        await h_lessons_review_lexis_next(message, state)
    elif message.text == "Изменить примечание":
        await h_lessons_review_grammar_next(message, state)
    elif message.text == "Изменить орг. моменты":
        await h_lessons_review_note_next(message, state)
    else:
        await message.answer(text="Я Вас не понял. Пожалуйста, "
                                  "выберите действие на клавиатуре")
