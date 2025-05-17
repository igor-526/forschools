from aiogram import types, Router
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext
from profile_management.models import NewUser, Telegram, ProfileEventsJournal
from tgbot.create_bot import bot
from tgbot.funcs.menu import send_menu
from tgbot.models import TgBotJournal

router = Router(name=__name__)


@router.message(CommandStart())
async def command_start_handler(message: types.Message, state: FSMContext):
    async def create_tgjournal_note(recipient: NewUser, connected_user: NewUser, message_result: types.Message):
        await TgBotJournal.objects.acreate(
            initiator=connected_user,
            recipient=recipient,
            event=11,
            data={
                "status": "success",
                "text": message_result.text,
                "msg_id": message_result.message_id,
                "errors": [],
                "attachments": []
            }
        )

    async def notify_admins(connected_user: NewUser):
        telegrams = [{"tg_id": tgnote.tg_id,
                      "user": tgnote.user} async for tgnote in
                     Telegram.objects.select_related("user").filter(user__groups__name='Admin',
                                                                    setting_notifications_tg_connecting=True,
                                                                    user__is_active=True).exclude(
                         user__id=connected_user.id)]
        for telegram in telegrams:
            try:
                message_result = await bot.send_message(chat_id=telegram.get("tg_id"),
                                                        text=f'Пользователь {connected_user.first_name} '
                                                             f'{connected_user.last_name} выполнил связку Telegram с '
                                                             f'профилем')
                await create_tgjournal_note(telegram.get("user"), connected_user, message_result)
            except Exception as e:
                pass

    async def create_event_note(connected_user: NewUser, main_tg):
        await ProfileEventsJournal.objects.acreate(
            event=0 if main_tg else 1,
            user=connected_user,
            initiator=connected_user
        )

    try:
        code = message.text.split(" ")[1]
        if len(code) != 5:
            await message.answer(text="Ошибка кода\n"
                                      "Для привязки бота к Вашему аккаунту воспользуйтесь ссылкой в Вашем профиле")
            return
        user = await NewUser.objects.filter(tg_code=code).afirst()
        tg_note = await Telegram.objects.filter(tg_id=message.from_user.id).afirst()
        if tg_note and await tg_note.allowed_users.filter(id=user.id).aexists():
            await message.answer(text="Ошибка.\nВаш Telegram уже привязан")
            return
        if user:
            tg_count = await user.telegram.acount()
            usertype = "main" if tg_count == 0 else "Родительский"
            message_text = "Аккаунт успешно привязан!\n"
            if not tg_note:
                tg_note = await Telegram.objects.acreate(user=user,
                                                         tg_id=message.from_user.id,
                                                         nickname=message.from_user.username,
                                                         first_name=message.from_user.first_name,
                                                         last_name=message.from_user.last_name,
                                                         usertype=usertype)
            elif tg_note and usertype == "main":
                await message.answer(text="Telegram можно привязать к второму аккаунту только родителям")
                return
            else:
                message_text += "Для смены аккаунта воспользуйтесь кнопкой <b>СМЕНИТЬ АККАУНТ</b> в главном меню"
            await tg_note.allowed_users.aadd(user)
            await notify_admins(user)
            await create_event_note(user, tg_count == 0)
            await message.answer(text=message_text)
            await send_menu(message.from_user.id, state)
    except IndexError:
        await message.answer(text="Для привязки бота к Вашему аккаунту воспользуйтесь ссылкой в Вашем профиле")
    except ValueError:
        await message.answer(text="Ошибка кода. "
                                  "Для привязки бота к Вашему аккаунту воспользуйтесь ссылкой в Вашем профиле")


@router.message(Command('reset'))
async def command_reset_handler(message: types.Message, state: FSMContext):
    await send_menu(message.from_user.id, state)
