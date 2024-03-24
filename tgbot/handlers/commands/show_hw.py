from aiogram import Router, F
from aiogram.types import CallbackQuery
from homework.models import Homework, HomeworkLog
from tgbot.create_bot import bot
from profile_management.models import Telegram
from tgbot.keyboards.show_keyboard import get_show_keys_hw_l

router = Router(name=__name__)


# @router.callback_query(HwCallback.filter(F.role == 1), HwCallback.filter(F.action == 'show'))
# async def show_hw(callback: CallbackQuery, callback_data: HwCallback):
#     hw = await (Homework.objects.select_related('teacher')
#                 .select_related('listener').filter(id=callback_data.number).afirst())
#     hw_text = (f'{hw.name}\n'
#                f'Проверяющий: {hw.teacher}\n'
#                f'Описание: {hw.description}\n'
#                f'Выполнить до: {hw.deadline}')
#     await bot.send_message(chat_id=callback.from_user.id,
#                            text=hw_text,
#                            reply_markup=get_hw_do_key(callback_data.number))
#
#
# @router.callback_query(HwCallback.filter(F.role == 1), HwCallback.filter(F.action == 'solution'))
# async def show_hw_solution(callback: CallbackQuery, callback_data: HwCallback):
#     hw = await Homework.objects.filter(id=callback_data.number).select_related('listener').select_related('teacher').afirst()
#     await HomeworkLog.objects.acreate(homework=hw,
#                                user=hw.listener,
#                                comment="Выполнено ДЗ!",
#                                status=2)
#     await bot.send_message(chat_id=callback.from_user.id,
#                            text="Бот спросил решение, ученик загрузил его, отфоткал и тд")
#     teacher = await Telegram.objects.filter(user=hw.teacher).afirst()
#     await bot.send_message(chat_id=teacher.tg_id, text="Ученик прислал Вам решение ДЗ!",
#                            reply_markup=get_show_keys_hw_l(hw.id, 2))
#
#
# @router.callback_query(HwCallback.filter(F.role == 2), HwCallback.filter(F.action == 'show'))
# async def show_hw_show(callback: CallbackQuery, callback_data: HwCallback):
#     hw_log = await (HomeworkLog.objects.filter(homework_id=callback_data.number)
#                     .select_related('homework').select_related('user').afirst())
#     msg = (f'ДЗ: {hw_log.homework.name}\n'
#            f'Ученик: {hw_log.user}\n'
#            f'Решение: {hw_log.comment}\n')
#     await bot.send_message(chat_id=callback.from_user.id,
#                            text=msg,
#                            reply_markup=get_check_hw_keys(callback_data.number))
#
#
# @router.callback_query(HwCallback.filter(F.role == 2), HwCallback.filter(F.action == 'accept_hw'))
# async def accept_hw_show(callback: CallbackQuery, callback_data: HwCallback):
#     hw = await Homework.objects.filter(id=callback_data.number).select_related('listener').select_related(
#         'teacher').afirst()
#     await HomeworkLog.objects.acreate(homework=hw,
#                                       user=hw.teacher,
#                                       comment="Комментарий, оставленный преподавателем",
#                                       status=3)
#     await bot.send_message(chat_id=callback.from_user.id, text="Бот спрашивает у преподавателя комментарий, фото и тд, "
#                                                                "после чего принимает ДЗ")
#     listener_tg = await Telegram.objects.filter(user=hw.listener).afirst()
#     await bot.send_message(chat_id=listener_tg.tg_id,
#                            text="Ваше ДЗ принято!",
#                            reply_markup=get_show_keys_hw_l(callback_data.number, 1, "show_log"))
#
#
# @router.callback_query(HwCallback.filter(F.role == 2), HwCallback.filter(F.action == 'decline_hw'))
# async def accept_hw_show(callback: CallbackQuery, callback_data: HwCallback):
#     hw = await Homework.objects.filter(id=callback_data.number).select_related('listener').select_related(
#         'teacher').afirst()
#     await HomeworkLog.objects.acreate(homework=hw,
#                                       user=hw.teacher,
#                                       comment="Комментарий, оставленный преподавателем на доработку",
#                                       status=4)
#     await bot.send_message(chat_id=callback.from_user.id, text="Бот спрашивает у преподавателя комментарий, фото и тд, "
#                                                                "после чего отправляет ДЗ на доработку")
#     listener_tg = await Telegram.objects.filter(user=hw.listener).afirst()
#     await bot.send_message(chat_id=listener_tg.tg_id,
#                            text="Ваше ДЗ отправлено на доработку!",
#                            reply_markup=get_show_keys_hw_l(callback_data.number, 1, "show_log"))
#
#
# @router.callback_query(HwCallback.filter(F.role == 2), HwCallback.filter(F.action == 'logs'))
# async def accept_hw_show(callback: CallbackQuery, callback_data: HwCallback):
#     hw = await Homework.objects.filter(id=callback_data.number).select_related('listener').select_related(
#         'teacher').afirst()
#     logs = [_ async for _ in HomeworkLog.objects.filter(homework=hw).select_related('user').all()]
#     msg = ""
#     for log in logs:
#         msg += f"{log.user} - {log.status}:\n{log.dt}\n\n"
#     msg += "Тут будет возможность выбрать любой лог и посмотреть по нему комментарий, фото и тд"
#     await bot.send_message(chat_id=callback.from_user.id, text=msg)
#
#
# @router.callback_query(HwCallback.filter(F.role == 1), HwCallback.filter(F.action == 'show_log'))
# async def accept_hw_showrr(callback: CallbackQuery, callback_data: HwCallback):
#     hw = await Homework.objects.filter(id=callback_data.number).select_related('listener').select_related(
#         'teacher').afirst()
#     log = await HomeworkLog.objects.filter(homework=hw).afirst()
#     await bot.send_message(chat_id=callback.from_user.id,
#                            text=f'{hw.name}\n'
#                                 f'{log.comment}',
#                            reply_markup=get_hw_do_key(callback_data.number))

