from aiogram import types
from profile_management.models import Telegram
from tgbot.create_bot import bot
from tgbot.keyboards.multiuser import get_multiuser_keyboard


async def f_multiuser_generate_message(message: types.Message):
    tg_note = await Telegram.objects.select_related("user").aget(tg_id=message.from_user.id)
    users = [{"name": f'{user.first_name} {user.last_name}',
              "id": user.id} async for user
             in tg_note.allowed_users.exclude(id=tg_note.user.id)]
    await message.answer(text=f"Текущий: {tg_note.user.first_name} "
                              f"{tg_note.user.last_name}\n"
                              f"Выберите пользователя:",
                         reply_markup=get_multiuser_keyboard(users))


async def f_multiuser_change_user(callback: types.CallbackQuery, new_user_id: int):
    tg_note = await Telegram.objects.select_related("user").aget(tg_id=callback.from_user.id)
    try:
        user = await tg_note.allowed_users.aget(id=new_user_id)
    except Exception:
        await bot.send_message(chat_id=callback.from_user.id,
                               text="Недостаточно прав")
        return None
    tg_note.user = user
    await tg_note.asave()
    await bot.send_message(chat_id=callback.from_user.id,
                           text="Пользователь успешно переключен")
