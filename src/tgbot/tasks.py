from dls.celery import app

from tgbot.utils import sync_funcs


@app.task
def notify_unsent_data_task():
    sync_funcs.notify_unsent_data()
