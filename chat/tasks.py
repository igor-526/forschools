from dls.celery import app
from tgbot.utils import sync_funcs


@app.task
def check_unsend_messages_task():
    sync_funcs.check_unsent_messages(True)
