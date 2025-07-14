from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from homework.models import HomeworkLog

from tgbot.create_bot import bot
from tgbot.finite_states.homework import HomeworkLogFSM
from tgbot.funcs.homeworks.homeworks import homework_tg_notify
from tgbot.funcs.homeworks.homeworks_agreement import f_homework_agr_send
from tgbot.keyboards.default import ready_cancel_keyboard
from tgbot.utils import aget_user_groups, get_user


async def f_homework_logs_change_log_message(callback: CallbackQuery,
                                             state: FSMContext,
                                             hw_log_id: int):
    try:
        hw_log = await HomeworkLog.objects.aget(pk=hw_log_id)
    except HomeworkLog.DoesNotExist:
        await callback.answer("Ошибка. Лога ДЗ не найдено")
        await callback.message.delete()
        return
    if hw_log.comment:
        msg_text = "Текущий текст ОС: " + hw_log.comment
    else:
        msg_text = "ОС не прокомментирована"
    msg_text += ("\nОтправьте мне новый текст для ОС или материалы "
                 "для добавления, после чего нажмите кнопку '<b>ГОТОВО</b>'")
    await state.set_state(HomeworkLogFSM.edit_log)
    await state.set_data({
        "comment": [],
        "files": [],
        "hw_log_id": hw_log.id
    })
    await bot.send_message(chat_id=callback.from_user.id,
                           text=msg_text,
                           reply_markup=ready_cancel_keyboard)


async def f_homework_logs_change_log_ready(message: Message,
                                           state: FSMContext):
    async def notify():
        user = await get_user(message.from_user.id)
        lesson = await hw_log.homework.aget_lesson()
        if not lesson:
            return
        plan = await lesson.aget_learning_plan()
        if user == plan.teacher or user == user == plan.default_hw_teacher:
            if plan.metodist:
                await homework_tg_notify(user,
                                         plan.metodist.id,
                                         [hw_log.homework],
                                         "Преподаватель изменил ОС ученику")
            for cur_id in [curator.id async for curator in
                           plan.curators.all()]:
                await homework_tg_notify(user,
                                         cur_id,
                                         [hw_log.homework],
                                         "Преподаватель изменил ОС ученику")
        if user == plan.metodist:
            await homework_tg_notify(
                user,
                (plan.default_hw_teacher.id if plan.default_hw_teacher
                 else plan.teacher.id),
                [hw_log.homework],
                "Методист изменил ОС ученику", 9
            )
            for cur_id in [curator.id async for curator in
                           plan.curators.all()]:
                await homework_tg_notify(user,
                                         cur_id,
                                         [hw_log.homework],
                                         "Методист изменил ОС ученику", 9)
        if await plan.curators.filter(id=user.id).aexists():
            await homework_tg_notify(user,
                                     plan.metodist.id,
                                     [hw_log.homework],
                                     "Куратор изменил ОС ученику")
            await homework_tg_notify(
                user,
                (plan.default_hw_teacher.id if plan.default_hw_teacher
                 else plan.teacher.id),
                [hw_log.homework],
                "Куратор изменил ОС ученику"
            )

    state_data = await state.get_data()
    try:
        hw_log = await HomeworkLog.objects.select_related(
            "homework", "homework__listener"
        ).aget(pk=state_data.get("hw_log_id"))
    except HomeworkLog.DoesNotExist:
        await message.answer("Ошибка. Лога ДЗ не найдено")
        await message.delete()
        return
    await hw_log.files.aadd(*state_data.get("files"))
    hw_log.comment = "<br>".join(state_data.get("comment"))
    await hw_log.asave()
    await message.answer("Обратная связь успешно изменена")
    await notify()

    user_groups = await aget_user_groups(
        (await get_user(message.from_user.id)).id
    )
    if "Metodist" in user_groups:
        await state.update_data(
            action="agreement_accept",
            comment=[],
            hw_id=hw_log.homework.id
        )
        await f_homework_agr_send(message.from_user.id, state, True)
