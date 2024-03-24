from aiogram.types import InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder



# def get_hw_do_key(hw_id: int) -> InlineKeyboardMarkup:
#     builder = InlineKeyboardBuilder()
#     builder.button(
#         text="Отправить решение",
#         callback_data=HwCallback(role=1, number=hw_id, action='solution')
#     )
#     return builder.as_markup()
#
#
# def get_check_hw_keys(hw_id: int) -> InlineKeyboardMarkup:
#     builder = InlineKeyboardBuilder()
#     builder.button(
#         text="Принять дз",
#         callback_data=HwCallback(role=2, number=hw_id, action='accept_hw')
#     )
#     builder.button(
#         text="Отправить на доработку",
#         callback_data=HwCallback(role=2, number=hw_id, action='decline_hw')
#     )
#     builder.button(
#         text="История ДЗ",
#         callback_data=HwCallback(role=2, number=hw_id, action='logs')
#     )
#     return builder.as_markup()
