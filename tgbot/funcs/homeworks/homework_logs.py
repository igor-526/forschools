from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from homework.models import HomeworkLog
from tgbot.create_bot import bot
from tgbot.finite_states.homework import HomeworkLogFSM
from tgbot.keyboards.default import ready_cancel_keyboard
from aiogram import types


async def f_homework_logs_change_log_message(callback: CallbackQuery, state: FSMContext, hw_log_id: int):
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


async def f_homework_logs_change_log_ready(message: types.Message, state: FSMContext):
    state_data = await state.get_data()
    try:
        hw_log = await HomeworkLog.objects.aget(pk=state_data.get("hw_log_id"))
    except HomeworkLog.DoesNotExist:
        await message.answer("Ошибка. Лога ДЗ не найдено")
        await message.delete()
        return
    await hw_log.files.aadd(*state_data.get("files"))
    hw_log.comment = "<br>".join(state_data.get("comment"))
    await hw_log.asave()
    await message.answer("Обратная связь успешно изменена")
