from aiogram import Router, F, types
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery

from chat.models import Message
from tgbot.create_bot import bot
from tgbot.funcs.chats import chats_send_ask, chats_send, chats_show_unread_messages
from tgbot.funcs.menu import send_menu
from tgbot.keyboards.callbacks.chats import ChatListCallback, ChatAnswerCallback
from tgbot.finite_states.chats import ChatsFSM

router = Router(name=__name__)


@router.callback_query(ChatListCallback.filter(F.action == 'send'))
async def h_chats_send_ask(callback: CallbackQuery,
                           callback_data: ChatListCallback,
                           state: FSMContext) -> None:
    await chats_send_ask(callback, callback_data.user_id, state)


@router.callback_query(ChatListCallback.filter(F.action == 'show'))
async def h_chats_show_unread(callback: CallbackQuery,
                              callback_data: ChatListCallback,
                              state: FSMContext) -> None:
    await chats_show_unread_messages(callback, callback_data)


@router.callback_query(ChatAnswerCallback.filter())
async def h_chats_answer(callback: CallbackQuery,
                         callback_data: ChatAnswerCallback,
                         state: FSMContext) -> None:
    print(callback_data.chat_message_id)
    try:
        chat_message = await (Message.objects.select_related("receiver").select_related("sender")
                              .aget(pk=callback_data.chat_message_id))
        await chat_message.aset_read()
        await chats_send_ask(callback, chat_message.sender.id, state)
    except Exception as e:
        await bot.send_message(chat_id=callback.chat.id, text=str(callback_data))
        await bot.send_message(chat_id=callback.chat.id, text=str(e))


@router.message(StateFilter(ChatsFSM.send_message),
                F.text == "Отмена")
async def h_chats_cancel(message: types.Message, state: FSMContext) -> None:
    await send_menu(message, state)

@router.message(StateFilter(ChatsFSM.send_message))
async def h_chats_send(message: types.Message, state: FSMContext) -> None:
    await chats_send(message, state)
