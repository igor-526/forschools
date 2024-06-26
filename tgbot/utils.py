from profile_management.models import NewUser, Telegram
from homework.models import Homework
from material.models import Material
from django.contrib.auth.models import Permission
from tgbot.create_bot import bot
import async_to_sync as sync
from tgbot.keyboards.materials import get_show_key
from tgbot.keyboards.homework import get_homeworks_buttons
from dls.utils import get_tg_id_sync


class AsyncClass:
    async def send_tg_message_sync(self, tg_id, message, reply_markup=None) -> dict:
        try:
            await bot.send_message(chat_id=tg_id, text=message, reply_markup=reply_markup)
            return {'status': 'success', 'errors': []}
        except Exception as e:
            return {'status': 'error', 'errors': [str(e)]}


sync_funcs = sync.methods(AsyncClass())


async def get_user(tg_id) -> NewUser or None:
    tg_note = await Telegram.objects.filter(tg_id=tg_id).select_related("user").afirst()
    if tg_note:
        return tg_note.user
    else:
        return None


async def get_tg_id(user: NewUser) -> int | None:
    tg_note = await Telegram.objects.filter(user=user).afirst()
    if tg_note:
        return tg_note.tg_id
    else:
        return None


async def get_group_and_perms(user_id) -> dict:
    user = await NewUser.objects.aget(id=user_id)
    groups = [group.name async for group in user.groups.all()]
    perms = [f"{perm.content_type.app_label}.{perm.codename}"
             async for perm in Permission.objects.select_related("content_type").filter(group__name__in=groups)]
    return {
        "groups": groups,
        "permissions": perms
    }


def send_material(user_id: int, material: Material) -> dict:
    user = Telegram.objects.get(user_id=user_id)
    return sync_funcs.send_tg_message_sync(tg_id=user.tg_id,
                                           message=f"Вам направлен материал <b>{material.name}</b>",
                                           reply_markup=get_show_key(material.id))


def send_homework_tg(user: NewUser, homework: Homework) -> dict:
    user_tg_id = get_tg_id_sync(user)
    if user_tg_id:
        return sync_funcs.send_tg_message_sync(tg_id=user_tg_id,
                                               message=f"У вас новое домашнее задание!\n"
                                                       f"Выполните его до: {homework.deadline}",
                                               reply_markup=get_homeworks_buttons([homework]))
    else:
        return {"status": "error",
                "errors": "not found"}


def send_homework_answer_tg(user: NewUser, homework: Homework, status: int) -> dict:
    user_tg_id = get_tg_id_sync(user)
    msg = None
    if status == 3:
        msg = f"Пришёл новый ответ от ученика по ДЗ <b>'{homework.name}'</b>"
    elif status in [4, 5]:
        msg = f"Пришёл новый ответ от преподавателя по ДЗ <b>'{homework.name}'</b>"
    if user_tg_id:
        return sync_funcs.send_tg_message_sync(tg_id=user_tg_id,
                                               message=msg,
                                               reply_markup=get_homeworks_buttons([homework]))
