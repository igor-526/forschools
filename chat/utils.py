from _operator import itemgetter
from typing import Dict
from django.utils import timezone


def chat_users_remove_duplicates(users):
    result = []
    for item in users:
        if item not in result:
            result.append(item)
    return result


def chat_users_sort(users):
    unread_list = list(filter(lambda u: u.get("unread"), users))
    has_messages_list = list(
        filter(lambda u: u.get("last_message_text") is not None and u not in unread_list, users))
    no_messages_list = list(filter(lambda u: u.get("last_message_text") is None, users))
    unread_list = sorted(unread_list, key=itemgetter("last_message_date"), reverse=True)
    has_messages_list = sorted(has_messages_list, key=itemgetter("last_message_date"), reverse=True)
    no_messages_list = sorted(no_messages_list, key=itemgetter("name"))
    return [*unread_list, *has_messages_list, *no_messages_list]


def chat_message_get_readtime() -> Dict[str, int]:
    readtime = timezone.now()
    readtime = {
        "year": readtime.year,
        "month": readtime.month,
        "day": readtime.day,
        "hour": readtime.hour,
        "minute": readtime.minute,
        "second": readtime.second,
    }
    return readtime


async def aget_unread_messages(tg_note,
                               sender=None,
                               sender_user_type: int = 0,
                               read: bool = False) -> list:
    user_type_self = await tg_note.aget_usertype()
    query = {
        "filter": {
            'receiver_type': user_type_self,
        },
        "exclude": {
            'read_data__has_key': f'{user_type_self}_{tg_note.user.id}'
        }
    }

    if sender:
        query["filter"]["sender__id"] = sender
        query["filter"]["sender_type"] = sender_user_type
    msg_query = [msg async for msg in tg_note.user.message_receiver.filter(
        **query['filter']
    ).exclude(**query['exclude'])]
    if read:
        for msg in msg_query:
            await msg.aset_read(user_id=tg_note.user.id,
                                usertype=user_type_self)
    return msg_query
