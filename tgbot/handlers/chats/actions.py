from aiogram import Router, F, types
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from chat.models import Message
from tgbot.create_bot import bot
from tgbot.funcs.chats import chats_send_ask, chats_type_message, chats_notify, chats_send
from tgbot.funcs.homeworks.homeworks import show_homework_queryset
from tgbot.funcs.menu import send_menu
from tgbot.keyboards.callbacks.chats import ChatListCallback, ChatAnswerMessageCallback
from tgbot.finite_states.chats import ChatsFSM
from tgbot.keyboards.chats import chats_get_users_buttons
from tgbot.utils import get_user

router = Router(name=__name__)


@router.callback_query(ChatListCallback.filter())
async def h_chats_send_ask(callback: CallbackQuery,
                           callback_data: ChatListCallback,
                           state: FSMContext) -> None:
    await callback.message.delete()
    await chats_send_ask(callback, callback_data, state)


@router.callback_query(ChatAnswerMessageCallback.filter())
async def h_chats_answer(callback: CallbackQuery,
                         callback_data: ChatAnswerMessageCallback,
                         state: FSMContext) -> None:
    chat_message = await (Message.objects.select_related("receiver").select_related("sender")
                          .aget(pk=callback_data.chat_message_id))
    await state.set_data({'files': [],
                          'comment': [],
                          'chat_type': "NewUser" if chat_message.sender else "Telegram",
                          'message_for': chat_message.sender.id if chat_message.sender else chat_message.sender_tg.id,
                          'message_tags': chat_message.tags})
    await bot.send_message(chat_id=callback.from_user.id,
                           text="Введите сообщение")
    await state.set_state(ChatsFSM.send_message)


@router.message(StateFilter(ChatsFSM.send_message),
                F.text == "Отмена")
async def h_chats_cancel(message: types.Message, state: FSMContext) -> None:
    await send_menu(message.from_user.id, state)


@router.message(StateFilter(ChatsFSM.send_message),
                F.text == "Отправить")
async def h_chats_send(message: types.Message, state: FSMContext) -> None:
    state_data = await state.get_data()
    if state_data.get("message_for"):
        await chats_send(message.from_user.id, state)
    else:
        user = await get_user(message.from_user.id)
        chats = await user.aget_users_for_chat(message.from_user.id)
        await message.answer(text="Выберите пользователя для отправки сообщения:",
                             reply_markup=chats_get_users_buttons(chats))


@router.message(StateFilter(ChatsFSM.send_message),
                F.text == "Отправить решение ДЗ")
async def h_chats_send_hw(message: types.Message, state: FSMContext) -> None:
    await state.update_data(materials_action="send_hw")
    await show_homework_queryset(message.from_user.id, state, "complete")


@router.message(StateFilter(ChatsFSM.send_message),
                F.media_group_id != None)
async def h_chats_type_media_group(message: types.Message, state: FSMContext, media_events=[]):
    await chats_type_message(media_events, state)


@router.message(StateFilter(ChatsFSM.send_message))
async def h_chats_type(message: types.Message, state: FSMContext) -> None:
    messages = [message]
    if message.reply_to_message:
        messages.append(message.reply_to_message)
    await chats_type_message(messages, state)
