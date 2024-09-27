from aiogram import types, Router
from aiogram.filters import CommandStart, StateFilter
from aiogram.fsm.context import FSMContext
from profile_management.models import NewUser, Telegram
from tgbot.funcs.menu import send_menu

router = Router(name=__name__)


@router.message(CommandStart())     # обработка команды /start и кода
async def command_start_handler(message: types.Message, state: FSMContext):
    try:
        code = message.text.split(" ")[1]
        if len(code) != 5:
            await message.answer(text="Ошибка кода. "
                                      "Для привязки бота к Вашему аккаунту воспользуйтесь ссылкой в Вашем профиле")
            return
        else:
            user = await NewUser.objects.filter(tg_code=code).afirst()
            if user:
                try:
                    await Telegram.objects.aget_or_create(user=user,
                                                          tg_id=message.from_user.id,
                                                          nickname=message.from_user.username)
                    await message.answer(text=f'Аккаунт успешно привязан!\n'
                                              f'Добро пожаловать, {user.first_name}!')
                    await send_menu(message.from_user.id, state)
                except Exception as ex:
                    await message.answer(text="Произошла нерпедвиденная ошибка. Попробуйте позже")
    except IndexError:
        await message.answer(text="Для привязки бота к Вашему аккаунту воспользуйтесь ссылкой в Вашем профиле")
        return
    except ValueError:
        await message.answer(text="Ошибка кода. "
                                  "Для привязки бота к Вашему аккаунту воспользуйтесь ссылкой в Вашем профиле")
        return
