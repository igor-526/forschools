from _operator import itemgetter

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
