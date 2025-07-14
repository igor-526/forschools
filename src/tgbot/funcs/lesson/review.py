from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State
from aiogram.types import Message

from lesson.models import Lesson, LessonTeacherReview
from lesson.permissions import a_can_set_passed_perm

from profile_management.models import Telegram

from tgbot.create_bot import bot
from tgbot.finite_states.lessons import LessonReviewFSM
from tgbot.funcs.homeworks.homeworks import homework_tg_notify
from tgbot.funcs.menu import send_menu
from tgbot.keyboards.lessons import get_lesson_review_field_keyboard


async def f_lesson_review_set_field(message: Message, state: FSMContext,
                                    field_name: str, max_length: int) -> bool:
    if not message.text:
        await bot.send_message(
            chat_id=message.from_user.id,
            text="Поддерживаются только текстовые комментарии"
        )
        return False
    if len(message.text) > max_length:
        await bot.send_message(
            chat_id=message.from_user.id,
            text=f"Длина наименования занятия не может "
                 f"превышать {max_length} символов"
        )
        return False
    sd = await state.get_data()
    if sd.get('lesson_review') is None:
        await bot.send_message(
            chat_id=message.from_user.id,
            text="Произошла ошибка. Информация о занятии не найдена\n"
                 "Попробуйте инициировать заполнение формы ещё раз"
        )
        await send_menu(message.from_user.id, state)
        return False
    sd['lesson_review'][field_name] = message.text
    await state.set_data(data=sd)
    return True


async def f_lesson_review_ask_field(tg_id: int, state: FSMContext,
                                    field_name: str, text_ask: str,
                                    text_current: str, set_state: State,
                                    lesson_id: int = None) -> None:
    sd = await state.get_data()
    text = text_ask
    if (sd.get('lesson_review') and
            sd['lesson_review'].get(field_name) is not None):
        text += (f"\n\n<b>{text_current}:</b> "
                 f"<code>{sd['lesson_review'][field_name]}</code>")
    if lesson_id is not None:
        sd['lesson_review'] = {"lesson_id": lesson_id}
    await state.set_data(data=sd)
    await state.set_state(set_state)
    await bot.send_message(
        chat_id=tg_id,
        text=text,
        reply_markup=get_lesson_review_field_keyboard(sd, field_name)
    )


async def f_lesson_review_confirm(message: Message, state: FSMContext) -> None:
    sd = await state.get_data()
    if sd.get('lesson_review') is None:
        await bot.send_message(
            chat_id=message.from_user.id,
            text="Произошла ошибка. Информация о занятии не найдена\n"
                 "Попробуйте инициировать заполнение формы ещё раз"
        )
        await send_menu(message.from_user.id, state)
        return None
    text = ("<b>Пожалуйста, проверьте ревью и измените "
            "в случае необходимости</b>\n\n")
    if sd['lesson_review'].get('name') is not None:
        text += (f"<b>Наименование занятия (УМК)</b>: "
                 f"{sd['lesson_review']['name']}\n")
    if sd['lesson_review'].get('materials') is not None:
        text += f"<b>Материалы</b>: {sd['lesson_review']['materials']}\n"
    if sd['lesson_review'].get('lexis') is not None:
        text += f"<b>Лексика</b>: {sd['lesson_review']['lexis']}\n"
    if sd['lesson_review'].get('grammar') is not None:
        text += f"<b>Грамматика</b>: {sd['lesson_review']['grammar']}\n"
    if sd['lesson_review'].get('note') is not None:
        text += f"<b>Примечание</b>: {sd['lesson_review']['note']}\n"
    if sd['lesson_review'].get('org') is not None:
        text += f"<b>Орг. моменты</b>: {sd['lesson_review']['org']}\n"
    await state.set_state(LessonReviewFSM.confirm)
    await bot.send_message(
        chat_id=message.from_user.id,
        text=text,
        reply_markup=get_lesson_review_field_keyboard(sd, "confirm")
    )


async def f_lesson_review_set_passed(message: Message,
                                     state: FSMContext) -> None:
    def form_is_full(state_data: dict) -> bool:
        return (state_data['lesson_review']['materials'] is not None and
                state_data['lesson_review']['lexis'] is not None and
                state_data['lesson_review']['grammar'] is not None and
                state_data['lesson_review']['note'] is not None and
                state_data['lesson_review']['org'] is not None)

    async def assing_and_notify():
        homeworks = [
            _ async for _ in
            lesson.homeworks.select_related("teacher", "listener").all()
        ]
        for homework in homeworks:
            res = await homework.aset_assigned()
            if (res and res.get("agreement") is not None and
                    res.get("agreement") is False):
                await homework_tg_notify(tg_note.user,
                                         homework.listener.id,
                                         [homework])
                if homework.for_curator:
                    for curator in [_ async for _ in plan.curators.all()]:
                        await homework_tg_notify(homework.teacher,
                                                 curator.id,
                                                 [homework],
                                                 "Преподаватель задал ДЗ")
            else:
                await homework_tg_notify(
                    homework.teacher,
                    plan.metodist.id,
                    [homework],
                    "Преподаватель задал ДЗ. Требуется согласование"
                )

    sd = await state.get_data()
    try:
        lesson = await Lesson.objects.aget(pk=sd['lesson_review']['lesson_id'])
        plan = await lesson.aget_learning_plan()
    except Lesson.DoesNotExist:
        await message.answer(text="Ошибка\nЗанятие не найдено")
        await send_menu(message.from_user.id, state)
        return None
    if lesson.status == 1:
        await message.answer(text="Ошибка\nЗанятие уже проведено")
        await send_menu(message.from_user.id, state)
        return None
    tg_note = await Telegram.objects.select_related(
        "user").aget(tg_id=message.from_user.id)
    if await a_can_set_passed_perm(tg_note.user, lesson):
        if form_is_full(sd):
            review = await LessonTeacherReview.objects.acreate(
                materials=sd['lesson_review']['materials'],
                lexis=sd['lesson_review']['lexis'],
                grammar=sd['lesson_review']['grammar'],
                note=sd['lesson_review']['note'],
                org=sd['lesson_review']['org']
            )
            lesson.lesson_teacher_review = review
        else:
            if not plan.can_report_lesson_name_only:
                await message.answer(
                    text="Ошибка\nНеобходимо заполнить форму полностью"
                )
                return None

        lesson.name = sd['lesson_review']['name']
        lesson.status = 1
        await lesson.asave()
        await assing_and_notify()
        await message.answer("Занятие успешно проведено. ДЗ задано")
        await send_menu(message.from_user.id, state)
    else:
        await message.answer(
            text="Ошибка\nНедостаточно прав для изменения статуса занятия"
        )
        return None
