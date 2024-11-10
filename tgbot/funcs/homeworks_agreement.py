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
from tgbot.models import TgBotJournal
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


async def f_homework_agr_send(message: types.Message,
                              state: FSMContext):
    async def notify_users(log_status, action):
        teacher_tg_id = await get_tg_id(hw.teacher.id, "main")
        if action == "agreement_accept":
            if teacher_tg_id:
                if log_status == 7:
                    teacher_msg_text = "Домашнее задание согласовано и задано"
                    await homework_tg_notify(hw.teacher,
                                             hw.listener.id,
                                             [hw])
                elif log_status == 4:
                    teacher_msg_text = "Ответ на решение согласован. ДЗ принято"
                elif log_status == 5:
                    teacher_msg_text = "Ответ на решение согласован. ДЗ отправлено на доработку"
                else:
                    teacher_msg_text = "Домашнее задание согласовано"
                if stdata.get("comment"):
                    teacher_msg_text += f'\n{stdata.get("comment")}'
                rm = get_homeworks_buttons([hw], sb=False)
                await bot.send_message(chat_id=teacher_tg_id,
                                       text=teacher_msg_text,
                                       reply_markup=rm)
                if log_status in [4, 5]:
                    listener_tgs = await get_tg_id(hw.listener.id)
                    for listener_tg in listener_tgs:
                        try:
                            msg = f"Пришёл новый ответ от преподавателя по ДЗ <b>'{hw.name}'</b>"
                            msg_object = await bot.send_message(chat_id=listener_tg.get("tg_id"),
                                                                text=msg,
                                                                reply_markup=get_homeworks_buttons([{
                                                                    'name': hw.name,
                                                                    'id': hw.id
                                                                }]))
                            await TgBotJournal.objects.acreate(
                                recipient=hw.listener,
                                initiator=hw.teacher,
                                event=4,
                                data={
                                    "status": "success",
                                    "text": msg,
                                    "msg_id": msg_object.message_id,
                                    "errors": [],
                                    "attachments": []
                                }
                            )
                        except Exception as e:
                            await TgBotJournal.objects.acreate(
                                recipient=hw.listener,
                                initiator=hw.teacher,
                                event=4,
                                data={
                                    "status": "error",
                                    "text": None,
                                    "msg_id": None,
                                    "errors": [str(e)],
                                    "attachments": []
                                }
                            )
        elif action == "agreement_decline":
            msg = await Message.objects.acreate(
                receiver=hw.teacher,
                sender=await get_user(message.from_user.id),
                message=stdata.get("comment"),
            )
            await chats_notificate(chat_message_id=msg, show=False)
            await bot.send_message(chat_id=teacher_tg_id,
                                   text="Редактировать ДЗ:",
                                   reply_markup=get_homework_edit_button(hw.id))

    stdata = await state.get_data()
    hw = await Homework.objects.aget(pk=stdata.get("hw_id"))
    logs = [log async for log in HomeworkLog.objects.filter(status__in=[5, 4, 7],
                                                            agreement__accepted=False,
                                                            homework=hw).order_by("-dt")]
    last_logs = []
    for log in logs:
        if last_logs:
            if last_logs[-1].status == log.status:
                last_logs.append(log)
            else:
                break
        else:
            last_logs.append(log)
    agreement = {
        "accepted_dt": datetime.datetime.now()
    }
    if stdata.get("action") == "agreement_accept":
        agreement["accepted"] = False
        if stdata.get("comment"):
            agreement["comment"] = stdata.get("comment")
    elif stdata.get("action") == "agreement_decline":
        agreement["accepted"] = False
        agreement["comment"] = stdata.get("comment")
    for log in last_logs:
        log.agreement = agreement
        await log.asave()
    await notify_users(last_logs[-1].status, stdata.get("action"))

