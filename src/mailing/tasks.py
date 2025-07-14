from django.core.mail import send_mail

from dls.settings import EMAIL_HOST_USER

from mailing.models import GroupMailingTasks

from profile_management.models import NewUser, Telegram

from tgbot.utils import sync_funcs


class MailingGroupTask:
    task: GroupMailingTasks
    result: dict

    def __init__(self, task_id: int):
        self.task = GroupMailingTasks.objects.get(id=task_id)
        self.result = {"info": {"errors": 0, "success": 0}}

    def execute(self):
        for user_id in self.task.users:
            user = NewUser.objects.get(id=user_id)
            self.result[f'{user.first_name} {user.last_name}'] = {
                "email": None,
                "tg": {}
            }
            if "Основной" in self.task.users[user_id]["tg"]:
                self.task.users[user_id]["tg"].remove("Основной")
                self.task.users[user_id]["tg"].append("main")
            tg_notes = [{"usertype": tg_note.usertype,
                         "tg_id": tg_note.tg_id} for tg_note in
                        Telegram.objects.filter(
                            user__id=user_id,
                            usertype__in=self.task.users[user_id]["tg"]
                        )]
            for tg_note in tg_notes:
                self._send_telegram_message(
                    tg_note,
                    self.result[f'{user.first_name} {user.last_name}']
                )
            if self.task.users[user_id].get("email"):
                self.result[(f'{user.first_name} '
                             f'{user.last_name}')]['email'] = {}
                self._send_email(user, self.result[f'{user.first_name} '
                                                   f'{user.last_name}'])
        self._set_result()

    def _send_telegram_message(self, tg_note, result_dict):
        for message in self.task.messages:
            message_text = ""
            if message.get("theme") != "":
                message_text += f'<b>{message.get("theme")}</b>\n'
            message_text += message.get("text")
            result = sync_funcs.send_tg_message_sync(tg_id=tg_note["tg_id"],
                                                     message=message_text)
            if result.get("status") == "success":
                self.result['info']['success'] += 1
            else:
                self.result['info']['errors'] += 1
            result_dict["tg"][tg_note["usertype"]] = result

    def _send_email(self, user: NewUser, result_dict):
        for message in self.task.messages:
            try:
                email = user.email if user.email and len(user.email) > 0 \
                    else None
                if not email:
                    result_dict["email"]["status"] = "error"
                    result_dict["email"]["errors"] = ["Email отсутствует"]
                    self.result['info']['errors'] += 1
                    return
                send_mail(message.get("theme") if message.get("theme") != ""
                          else "Без темы",
                          message.get("text"),
                          EMAIL_HOST_USER,
                          [email],
                          fail_silently=False)
                result_dict["email"]["status"] = "success"
                result_dict["email"]["errors"] = []
                self.result['info']['success'] += 1
            except Exception as e:
                result_dict["email"]["status"] = "error"
                result_dict["email"]["errors"] = [str(e)]
                self.result['info']['errors'] += 1

    def _set_result(self):
        self.task.result_info = self.result
        self.task.save()
