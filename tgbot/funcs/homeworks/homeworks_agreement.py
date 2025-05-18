import datetime
from aiogram import types
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from chat.models import Message
from tgbot.funcs.homeworks.homeworks import homework_tg_notify
from tgbot.funcs.materials_add import FileParser
from tgbot.keyboards.callbacks.homework import HomeworkCallback
from tgbot.keyboards.homework import get_homework_agreement_buttons
from tgbot.finite_states.homework import HomeworkAgreementFSM
from tgbot.funcs.menu import send_menu
from tgbot.funcs.chats import chats_notify
from homework.models import Homework, HomeworkLog
from tgbot.create_bot import bot
from tgbot.utils import get_user
from user_logs.models import UserLog


async def f_homework_agr_message(callback: CallbackQuery,
                                 callback_data: HomeworkCallback,
                                 state: FSMContext):
    await state.set_data({
        "action": callback_data.action,
        "hw_id": callback_data.hw_id,
        "files": [],
        "comment": []
    })
    msg = ""
    rm = None
    if callback_data.action == "agreement_accept":
        msg = ("При необходимости отправьте мне комментарий на действие преподавателя.\n"
               "После чего нажмите кнопку 'Согласовать'")
        rm = get_homework_agreement_buttons("accept")
    elif callback_data.action == "agreement_decline":
        msg = ("Отправьте мне хотя бы один комментарий на действие преподавателя.\n"
               "После чего нажмите кнопку 'Отправить на корректировку'")
        rm = get_homework_agreement_buttons("decline")
    await bot.send_message(chat_id=callback.from_user.id,
                           text=msg,
                           reply_markup=rm)
    await state.set_state(HomeworkAgreementFSM.message)


async def f_homework_agr_add_comment(messages: list[types.Message],
                                     state: FSMContext):
    files_list = []
    comments_list = []
    st_data = await state.get_data()
    msg = ""
    rm = None
    if st_data.get("action") == "agreement_accept":
        msg = ("Принято! При необходимости отправьте мне ещё комментарий.\n"
               "После чего нажмите кнопку 'Согласовать'")
        rm = get_homework_agreement_buttons("accept")
    elif st_data.get("action") == "agreement_decline":
        msg = ("Принято! При необходимости отправьте мне ещё комментарий.\n"
               "После чего нажмите кнопку 'Отправить на корректировку'")
        rm = get_homework_agreement_buttons("decline")
    for m in messages:
        file = FileParser(
            message=m,
            mode="file",
            success_text=msg,
            reply_markup=rm,
            add_time_stamp=False,
            ignore_text=True
        )
        await file.download()
        if file.ready_file:
            files_list.append(file.ready_file.id)
        if file.file_description:
            comments_list.append(file.file_description)
    state_data = await state.get_data()
    state_data["files"].extend(files_list)
    state_data["comment"].extend(comments_list)
    await state.set_data(state_data)


async def f_homework_agr_send(tg_id: int,
                              state: FSMContext,
                              stealth=False):
    async def get_logs_info():
        hw = await Homework.objects.select_related("teacher").select_related("listener").aget(pk=st_data.get("hw_id"))
        last_log = await hw.aget_status()
        if last_log and last_log.status == 7:
            hw_group = await hw.homeworkgroups_set.afirst()
            hws = [hw async for hw in hw_group.homeworks.select_related("teacher").select_related("listener").all()] \
                if hw_group else [hw]
        else:
            hws = [hw]
        lesson = await hw.aget_lesson()
        lp = (await lesson.aget_learning_plan()) if lesson else None
        to_agreement = [log async for log in
                        HomeworkLog.objects.select_related("homework").select_related("homework__listener")
                        .select_related("homework__teacher").select_related("user")
                        .filter(status__in=[5, 4, 7],
                                homework__id__in=[hw.id for hw in hws],
                                agreement__accepted=False)]
        return {
            "homeworks": hws,
            "logs": to_agreement,
            "plan": lp
        }

    async def notify_users(logs, hws, action):
        msg_teacher = ""
        msg_curator = ""
        msg_listener = ""
        msg_chat_teacher_send = False
        hw = logs[0].homework
        is_teacher = logs[0].user == logs_info.get("plan").teacher or logs[0].user == logs_info.get("plan").default_hw_teacher
        is_curator = await logs_info.get("plan").curators.filter(id=logs[0].user.id).aexists()
        for log_ in logs:
            if action == "agreement_accept":
                if log_.status == 7:
                    msg_listener = "У вас новое домашнее задание!"
                    if is_teacher:
                        msg_teacher = "ДЗ согласовано методистом и задано ученику"
                        msg_curator = "Преподаватель задал новое ДЗ"
                    elif is_curator:
                        msg_teacher = "ДЗ куратора согласовано методистом и задано ученику"
                elif log_.status == 4:
                    msg_listener = "Домашнее задание принято!"
                    if is_teacher:
                        msg_teacher = "Принятие ДЗ согласовано методистом. Ученик уведомлён"
                        msg_curator = "Преподаватель принял у ученика ДЗ"
                    elif is_curator:
                        msg_teacher = "Принятие ДЗ от куратора согласовано методистом. Ученик уведомлён"
                elif log_.status == 5:
                    msg_listener = "Домашнее задание отправлено на доработку!"
                    if is_teacher:
                        msg_teacher = "Отправка ДЗ на доработку согласована методистом. Ученик уведомлён"
                        msg_curator = "Преподаватель отправил на доработку ДЗ"
                    elif is_curator:
                        msg_teacher = "Отправка ДЗ от куратора на доработку согласована методистом. Ученик уведомлён"
                await homework_tg_notify(logs_info.get("plan").metodist,
                                         log_.homework.teacher.id,
                                         [log_.homework],
                                         msg_teacher, 8)
                await homework_tg_notify(logs_info.get("plan").metodist,
                                         log_.homework.listener.id,
                                         [log_.homework],
                                         msg_listener)
                if log_.homework.for_curator:
                    [await homework_tg_notify(logs_info.get("plan").metodist,
                                              curator.id,
                                              [log_.homework],
                                              msg_curator, 8)
                     async for curator in logs_info.get("plan").curators.all()]
            elif action == "agreement_decline":
                if log_.status == 7:
                    msg_teacher = "ДЗ НЕ согласовано методистом и не задано"
                elif log_.status == 4:
                    msg_teacher = "Принятие ДЗ НЕ согласовано методистом"
                elif log_.status == 5:
                    msg_teacher = "Отправка ДЗ на доработку НЕ согласовано методистом"
                if not msg_chat_teacher_send:
                    msg = await Message.objects.acreate(
                        receiver=log_.homework.teacher,
                        sender=await get_user(tg_id),
                        sender_type=0,
                        receiver_type=0,
                        message="\n".join(st_data.get("comment")),
                        tags=[f"hw{hw.id}" for hw in hws]
                    )
                    await chats_notify(msg.id)
                    msg_chat_teacher_send = True
                await homework_tg_notify(logs_info.get("plan").metodist,
                                         log_.homework.teacher.id,
                                         [log_.homework],
                                         msg_teacher, 8)

    async def journal_log():
        title = "Действие преподавателя согласовано" if st_data.get("action") == "agreement_accept" else \
            "Действие преподавателя НЕ согласовано"
        color = "info" if st_data.get("action") == "agreement_accept" else "warning"
        lesson = await logs_info.get("homeworks")[0].lesson_set.afirst()
        content = {"list": [],
                   "text": [f'Методист обработал действие преподавателя по ДЗ к занятию '
                            f'"{lesson.name}" от {lesson.date.strftime("%d.%m.%Y")}',
                            f'Проверяющий ДЗ: {logs_info.get("homeworks")[0].teacher.first_name} '
                            f'{logs_info.get("homeworks")[0].teacher.last_name}']}
        buttons = []
        for l_ in logs_info.get("logs"):
            if l_.status == 7:
                content['list'].append({
                    "name": "Тип события",
                    "val": "согласование ДЗ"
                })
            elif l_.status == 4:
                content['list'].append({
                    "name": "Тип события",
                    "val": "принятие ДЗ"
                })
            elif l_.status == 5:
                content['list'].append({
                    "name": "Тип события",
                    "val": "отправка ДЗ на доработку"
                })
        for hw in logs_info.get("homeworks"):
            content['list'].append({
                "name": "Ученик",
                "val": f"{hw.listener.first_name} {hw.listener.last_name}"
            })
            buttons.append({"inner": f"{hw.name} ({hw.listener.first_name} {hw.listener.last_name})",
                            "href": f"/homeworks/{hw.id}"})
        buttons.append({"inner": "Занятие",
                        "href": f"/lessons/{lesson.id}"})

        if st_data.get("action") == "agreement_decline":
            buttons.append({"inner": '<i class="bi bi-chat"></i>',
                            "href": f"#tag=hw{logs_info.get('homeworks')[0].id}"})

        if st_data.get("comment"):
            content['list'].append({
                "name": "Комментарий",
                "val": st_data.get("comment")
            })
        await UserLog.objects.acreate(
            log_type=1,
            learning_plan=logs_info.get("plan"),
            title=title,
            content=content,
            buttons=buttons,
            user=logs_info.get("plan").metodist,
            color=color
        )

    st_data = await state.get_data()
    logs_info = await get_logs_info()
    if not logs_info.get("logs"):
        if not stealth:
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
    if st_data.get("action") == "agreement_accept":
        agreement["accepted"] = True
        answer_msg = "Действия преподавателя согласованы. Уведомления отправлены"
        if logs_info.get("homeworks") and len(logs_info.get("homeworks")) > 1:
            answer_msg += "\nНет необходимости согласовывать другие ДЗ для группового занятия"
    elif st_data.get("action") == "agreement_decline":
        agreement["accepted"] = False
        agreement["comment"] = "\n".join(st_data.get("comment"))
        answer_msg = "Действия преподавателя не согласованы. Уведомления отправлены"
        if logs_info.get("homeworks") and len(logs_info.get("homeworks")) > 1:
            answer_msg += "\nНет необходимости согласовывать другие ДЗ для группового занятия"
    for log in logs_info.get("logs"):
        log.agreement = agreement
        await log.asave()
    await notify_users(logs_info.get("logs"), logs_info.get("homeworks"), st_data.get("action"))
    await journal_log()
    await bot.send_message(chat_id=tg_id,
                           text=answer_msg)
    await send_menu(tg_id, state)

