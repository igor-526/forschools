from aiogram.filters.callback_data import CallbackData


class LessonScheduleListCallback(CallbackData, prefix="lesson_schedule"):
    user_id: int
