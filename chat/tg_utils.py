from tgbot.funcs.chats import chats_notify, admin_chats_notify
import async_to_sync as sync


class AsyncChatClass:
    async def notify_message(self, message_id: int):
        await chats_notify(message_id)

    async def notify_admin_message(self, message_id: int):
        await admin_chats_notify(message_id)


tg_sync_chat_funcs = sync.methods(AsyncChatClass())
