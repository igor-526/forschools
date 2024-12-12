import datetime
from aiogram import types
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from chat.models import Message
from tgbot.funcs.homeworks import homework_tg_notify
from tgbot.keyboards.callbacks.homework import HomeworkCallback
from tgbot.keyboards.homework import get_homeworks_buttons, get_homework_agreement_buttons, get_homework_edit_button
from tgbot.finite_states.homework import HomeworkAgreementFSM
from tgbot.funcs.menu import send_menu
from tgbot.funcs.chats import chats_notificate
from homework.models import Homework, HomeworkLog
from tgbot.create_bot import bot
from tgbot.utils import get_user, get_tg_id


async def f_homework_agr_message(callback: CallbackQuery,
                                 callback_data: HomeworkCallback,
                                 state: FSMContext):
    await state.set_data({
        "action": callback_data.action,
        "hw_id": callback_data.hw_id
    })
    msg = ""
    rm = None
    if callback_data.action == "agreement_accept":
        msg = ("При необходимости отправьте мне текстовый комментарий на действие преподавателя.\n"
               "После чего нажмите кнопку 'Согласовать'")
        rm = get_homework_agreement_buttons("accept")
    elif callback_data.action == "agreement_decline":
        msg = ("Отправьте мне хотя бы один текстовый комментарий на действие преподавателя.\n"
               "После чего нажмите кнопку 'Отправить на корректировку'")
        rm = get_homework_agreement_buttons("decline")
    await bot.send_message(chat_id=callback.from_user.id,
                           text=msg,
                           reply_markup=rm)
    await state.set_state(HomeworkAgreementFSM.message)


async def f_homework_agr_add_comment(message: types.Message,
                                     state: FSMContext):
    if not message.text:
        await message.reply("Возможно добавление только текстовых комментариев")
        return
    stdata = await state.get_data()
    comment = stdata.get("comment")
    if comment is None:
        com = message.text
    else:
        com = f'{comment}\n___\n{message.text}'
    if len(com) > 2000:
        await message.reply("Общая длина комментариев не может превышать 2000 символов")
    else:
        await state.update_data(comment=com)
    msg = ""
    rm = None
    if stdata.get("action") == "agreement_accept":
        msg = ("Принято! При необходимости отправьте мне ещё комментарий.\n"
               "После чего нажмите кнопку 'Согласовать'")
        rm = get_homework_agreement_buttons("accept")
    elif stdata.get("action") == "agreement_decline":
        msg = ("Принято! При необходимости отправьте мне ещё комментарий.\n"
               "После чего нажмите кнопку 'Отправить на корректировку'")
        rm = get_homework_agreement_buttons("decline")
    await message.reply(text=msg,
                        reply_markup=rm)


async def f_homework_agr_send(tg_id: int,
                              state: FSMContext):
    async def notify_users(log_status, action):
        msg_teacher = ""
        msg_curator = ""
        msg_listener = ""
        if action == "agreement_accept":
            if log_status == 7:
                msg_teacher = "ДЗ согласовано методистом и задано ученику"
                msg_curator = "Преподаватель задал новое ДЗ"
                msg_listener = "У вас новое домашнее задание!"
            elif log_status == 4:
                msg_teacher = "Принятие ДЗ согласовано методистом. Ученик уведомлён"
                msg_curator = "Преподаватель принял у ученика ДЗ"
                msg_listener = "Домашнее задание принято!"
            elif log_status == 5:
                msg_teacher = "Отправка ДЗ на доработку согласовано методистом. Ученик уведомлён"
                msg_curator = "Преподаватель отправил на доработку ДЗ"
                msg_listener = "Домашнее задание отправлено на доработку!"
            await homework_tg_notify(lp.metodist,
                                     hw.teacher.id,
                                     [hw],
                                     msg_teacher)
            await homework_tg_notify(lp.metodist,
                                     hw.listener.id,
                                     [hw],
                                     msg_listener)
            if hw.for_curator:
                [await homework_tg_notify(lp.metodist,
                                          curator.id,
                                          [hw],
                                          msg_curator)
                 async for curator in lp.curators.all()]

        elif action == "agreement_decline":
            if log_status == 7:
                msg_teacher = "ДЗ НЕ согласовано методистом и не задано"
            elif log_status == 4:
                msg_teacher = "Принятие ДЗ НЕ согласовано методистом"
            elif log_status == 5:
                msg_teacher = "Отправка ДЗ на доработку НЕ согласовано методистом"
            msg = await Message.objects.acreate(
                receiver=hw.teacher,
                sender=await get_user(tg_id),
                message=stdata.get("comment"),
            )
            await chats_notificate(chat_message_id=msg.id, show=False)
            await homework_tg_notify(lp.metodist,
                                     hw.teacher.id,
                                     [hw],
                                     msg_teacher)

    stdata = await state.get_data()
    hw = await Homework.objects.select_related("teacher").select_related("listener").aget(pk=stdata.get("hw_id"))
    lesson = await hw.aget_lesson()
    lp = (await lesson.aget_learning_plan()) if lesson else None
    logs = [log async for log in HomeworkLog.objects.filter(status__in=[5, 4, 7],
                                                            agreement__accepted=False,
                                                            homework=hw).order_by("-dt")]
    if not logs:
        await bot.send_message(chat_id=tg_id,
                               text="ДЗ не нуждается в согласовании")
        return
    now = datetime.datetime.now()
    agreement = {
        "accepted_dt": {
            "year": now.year,
            "month": now.month,
            "day": now.day,
            "hour": now.hour,
            "minute": now.minute
        }
    }
    answer_msg = "Отправлено успешно"
    if stdata.get("action") == "agreement_accept":
        agreement["accepted"] = True
        answer_msg = "Действия преподавателя согласованы. Уведомления отправлены"
    elif stdata.get("action") == "agreement_decline":
        agreement["accepted"] = False
        agreement["comment"] = stdata.get("comment")
        answer_msg = "Действия преподавателя не согласованы. Уведомления отправлены"
    for log in logs:
        log.agreement = agreement
        await log.asave()
    await notify_users(logs[-1].status, stdata.get("action"))
    await bot.send_message(chat_id=tg_id,
                           text=answer_msg)
    await send_menu(tg_id, state)

