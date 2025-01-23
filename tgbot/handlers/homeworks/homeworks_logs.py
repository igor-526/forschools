from aiogram import Router, F, types
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from homework.models import HomeworkLog
from tgbot.keyboards.callbacks.homework import HomeworkLogEditingCallback

router = Router(name=__name__)


@router.callback_query(HomeworkLogEditingCallback.filter(F.action == "feedback_delete_file"))
async def h_homework_log_delete_file(callback: CallbackQuery,
                                     callback_data: HomeworkLogEditingCallback) -> None:
    try:
        hw_log = await HomeworkLog.objects.aget(pk=callback_data.hw_log_id)
    except HomeworkLog.DoesNotExist:
        await callback.answer("Ошибка. Лога ДЗ не найдено")
        await callback.message.delete()
        return
    await hw_log.files.aset([file.id async for file in hw_log.files.exclude(id=callback_data.file_id)])
    await callback.answer("Файла больше нет в ОС")
    await callback.message.delete()


@router.callback_query(HomeworkLogEditingCallback.filter(F.action == "feedback_delete"))
async def h_homework_log_delete(callback: CallbackQuery,
                                callback_data: HomeworkLogEditingCallback) -> None:
    try:
        hw_log = await HomeworkLog.objects.aget(pk=callback_data.hw_log_id)
    except HomeworkLog.DoesNotExist:
        await callback.answer("Ошибка. Лога ДЗ не найдено")
        await callback.message.delete()
        return
    await hw_log.adelete()
    await callback.answer("ОС удалена")
    await callback.message.delete()