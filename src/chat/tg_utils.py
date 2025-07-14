import async_to_sync as sync

from tgbot.funcs.chats import admin_chats_notify, chats_notify


class AsyncChatClass:
    async def notify_message(self, message_id: int):
        await chats_notify(message_id)

    async def notify_admin_message(self, message_id: int):
        await admin_chats_notify(message_id)


tg_sync_chat_funcs = sync.methods(AsyncChatClass())
