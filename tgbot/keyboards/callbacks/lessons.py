from aiogram.filters.callback_data import CallbackData


class LessonScheduleListCallback(CallbackData, prefix="lesson_schedule"):
    user_id: int


class LessonPlaceCallback(CallbackData, prefix="lesson_place"):
    place_id: int
