from aiogram import Router, types
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext

from django.db.models import Q

from profile_management.models import (NewUser,
                                       ProfileEventsJournal,
                                       Telegram)

from tgbot.create_bot import bot
from tgbot.funcs.menu import send_menu
from tgbot.models import TgBotJournal

router = Router(name=__name__)


class TelegramAuthException(Exception):
    pass


@router.message(CommandStart())
async def command_start_handler(message: types.Message,
                                state: FSMContext) -> None:
    async def create_tg_journal_note(recipient: NewUser,
                                     connected_user: NewUser,
                                     message_result: types.Message) -> None:
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

    async def notify_admins(connected_user: NewUser) -> None:
        telegrams = [{"tg_id": tgnote.tg_id,
                      "user": tgnote.user} async for tgnote in
                     Telegram.objects.select_related("user").filter(
                         user__groups__name='Admin',
                         setting_notifications_tg_connecting=True,
                         user__is_active=True
                     ).exclude(
                         user__id=connected_user.id)]
        for telegram in telegrams:
            try:
                message_result = await bot.send_message(
                    chat_id=telegram.get("tg_id"),
                    text=f'Пользователь {connected_user.first_name} '
                         f'{connected_user.last_name} выполнил связку '
                         f'Telegram с профилем'
                )
                await create_tg_journal_note(recipient=telegram.get("user"),
                                             connected_user=connected_user,
                                             message_result=message_result)
            except Exception:
                pass

    async def create_event_note(connected_user: NewUser,
                                main_tg: bool) -> None:
        await ProfileEventsJournal.objects.acreate(
            event=0 if main_tg else 1,
            user=connected_user,
            initiator=connected_user
        )

    try:
        code = message.text.split(" ")[1]
        if len(code) != 5:
            raise TelegramAuthException(
                "Ошибка кода\nДля привязки бота к Вашему "
                "аккаунту воспользуйтесь ссылкой в Вашем профиле"
            )
        user = await NewUser.objects.filter(tg_code=code).afirst()
        if not user:
            raise TelegramAuthException(
                "Ошибка кода\nДля привязки бота к Вашему "
                "аккаунту воспользуйтесь ссылкой в Вашем профиле"
            )
        tg_note = await Telegram.objects.filter(
            tg_id=message.from_user.id
        ).afirst()
        message_text = "Аккаунт успешно привязан!\n"
        if tg_note:
            has_this_user = await Telegram.objects.filter(
                Q(id=tg_note.id,
                  allowed_users=user) |
                Q(id=tg_note.id,
                  allowed_parents=user)
            ).aexists()
            if has_this_user:
                raise TelegramAuthException(
                    "Вы уже привязаны к данному пользователю"
                )
            message_text += ("Для смены аккаунта воспользуйтесь кнопкой "
                             "<b>СМЕНИТЬ АККАУНТ</b> в главном меню")
        else:
            tg_note = await Telegram.objects.acreate(
                user=user,
                tg_id=message.from_user.id,
                nickname=message.from_user.username,
                first_name=message.from_user.first_name,
                last_name=message.from_user.last_name
            )
            await tg_note.aupdate_access_token()
        telegrams_count = await Telegram.objects.filter(
            Q(allowed_users=user) | Q(allowed_parents=user)
        ).aexists()
        if telegrams_count:
            await tg_note.allowed_parents.aadd(user)
        else:
            await tg_note.allowed_users.aadd(user)
        await notify_admins(user)
        await create_event_note(user, not telegrams_count)
        await message.answer(text=message_text)
        await send_menu(message.from_user.id, state)

    except (IndexError, ValueError):
        await message.answer(text="Для привязки бота к Вашему аккаунту "
                                  "воспользуйтесь ссылкой в Вашем профиле")
    except TelegramAuthException as ex:
        await message.answer(text=str(ex))


@router.message(Command('reset'))
async def command_reset_handler(message: types.Message, state: FSMContext):
    await send_menu(message.from_user.id, state)
