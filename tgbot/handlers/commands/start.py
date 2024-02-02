from aiogram import types, Router
from aiogram.filters import CommandStart
from profile_management.models import NewUser

router = Router(name=__name__)

"""
Обработка команды /start + code
"""


@router.message(CommandStart())
async def command_start_handler(message: types.Message):
    try:
        code = message.text.split(" ")[1]
        if len(code) != 5:
            await message.answer(text="Ошибка кода1. "
                                      "Для привязки бота к Вашему аккаунту воспользуйтесь ссылкой в Вашем профиле")
            return
        else:
            user = await NewUser.objects.afirst()
            await message.answer(text=user.username)
    except IndexError:
        await message.answer(text="Для привязки бота к Вашему аккаунту воспользуйтесь ссылкой в Вашем профиле")
        return
    except ValueError:
        await message.answer(text="Ошибка кода2. "
                                  "Для привязки бота к Вашему аккаунту воспользуйтесь ссылкой в Вашем профиле")
        return
