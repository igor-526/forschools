import datetime
from typing import Type

from aiogram import types
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from django.db.models import Q
from lesson.models import Lesson
from tgbot.funcs.fileutils import filechecker, filedownloader
from tgbot.funcs.materials import send_material_item
from tgbot.keyboards.callbacks.homework import HomeworkCallback
from tgbot.keyboards.homework import (get_homework_item_buttons, get_homeworks_buttons,
                                      get_hwlogs_buttons, get_homework_menu_buttons, get_homework_lessons_buttons,
                                      get_homework_editing_buttons, get_homework_agreement_buttons)
from tgbot.keyboards.default import cancel_keyboard, yes_cancel_keyboard, message_typing_keyboard
from tgbot.finite_states.homework import HomeworkFSM, HomeworkNewFSM, HomeworkAgreementFSM
from tgbot.funcs.menu import send_menu
from tgbot.models import TgBotJournal
from tgbot.utils import get_tg_id, get_tg_note
from profile_management.models import NewUser
from homework.models import Homework, HomeworkLog
from tgbot.create_bot import bot
from tgbot.utils import get_group_and_perms, get_user
from homework.utils import status_code_to_string
from material.utils.get_type import get_type
from aiogram.utils.media_group import MediaGroupBuilder


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
    stdata = await state.get_data()
    hw = await Homework.objects.get(pk=stdata.get("hw_id"))

    last_logs = []
    all_logs = [log async for log in HomeworkLog.objects.filter(status__in=[3, 4, 7])]
    # if last_logs:
    #     if last_logs[-1]['status'] == log.status:
    #         last_logs.append({'id': log.id,
    #                           'status': log.status})
    #     else:
    #         break
    # else:
    #     last_logs.append({'id': log.id,
    #                       'status': log.status})
    queryset = HomeworkLog.objects.filter(id__in=[log["id"] for log in last_logs]).order_by('-dt')

    last_statuses = await hw.aget_status()
    if stdata.get("action") == "agreement_accept":
        pass
    elif stdata.get("action") == "agreement_decline":
        pass