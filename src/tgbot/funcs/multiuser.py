from aiogram import types

from django.db.models import Q

from profile_management.models import NewUser, Telegram

from tgbot.create_bot import bot
from tgbot.keyboards.multiuser import get_multiuser_keyboard


async def f_multiuser_generate_message(message: types.Message):
    tg_note = await Telegram.objects.select_related(
        "user").aget(tg_id=message.from_user.id)
    users = [{"name": f'{user.first_name} {user.last_name}',
              "id": user.id} async for user
             in tg_note.allowed_users.exclude(id=tg_note.user.id)]
    users.extend(
        [{"name": f'{user.first_name} {user.last_name}',
          "id": user.id} async for user
         in tg_note.allowed_parents.exclude(id=tg_note.user.id)]
    )
    await message.answer(text=f"Текущий: {tg_note.user.first_name} "
                              f"{tg_note.user.last_name}\n"
                              f"Выберите пользователя:",
                         reply_markup=get_multiuser_keyboard(users))


async def f_multiuser_change_user(callback: types.CallbackQuery,
                                  new_user_id: int) -> None:
    tg_note = await Telegram.objects.select_related("user").aget(
        tg_id=callback.from_user.id
    )
    try:
        if not await Telegram.objects.filter(
                Q(allowed_users=new_user_id) |
                Q(allowed_parents=new_user_id)
        ).aexists():
            await bot.send_message(chat_id=callback.from_user.id,
                                   text="Недостаточно прав")
        user = await NewUser.objects.aget(id=new_user_id)
    except NewUser.DoesNotExist:
        await bot.send_message(chat_id=callback.from_user.id,
                               text="Пользователь не найден")
        return None
    tg_note.user = user
    await tg_note.asave()
    await bot.send_message(chat_id=callback.from_user.id,
                           text="Пользователь успешно переключен")
