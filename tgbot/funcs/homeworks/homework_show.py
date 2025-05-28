import async_to_sync as sync
from aiogram.fsm.context import FSMContext
from aiogram.fsm.storage.base import StorageKey
from django.db.models import Q
from homework.models import Homework, HomeworkLog
from homework.utils import status_code_to_string
from learning_plan.models import LearningPlan
from lesson.models import Lesson
from profile_management.models import NewUser, Telegram
from tgbot.create_bot import bot, dp
from tgbot.finite_states.homework import HomeworkNewFSM
from tgbot.funcs.fileutils import send_file
from tgbot.funcs.materials import send_material_item
from tgbot.keyboards.homework import (get_hw_log_delete_file_button,
                                      get_hw_log_edit_button,
                                      get_homework_item_buttons,
                                      get_homeworks_buttons,
                                      get_homework_editing_buttons)
from tgbot.utils import get_user, get_tg_note


class TGHomework:
    homework_id: int
    telegram_id: int
    user: NewUser
    telegram_note: Telegram
    user_roles: dict
    homework: Homework
    homework_last_log: HomeworkLog
    lesson: Lesson | None
    plan: LearningPlan | None

    def __init__(self, homework_id, telegram_id):
        self.homework_id = homework_id
        self.telegram_id = telegram_id

    async def ainit_homework(self) -> None:
        self.homework = await (Homework.objects.select_related("listener")
                               .select_related("teacher")
                               .aget(pk=self.homework_id))
        self.telegram_note = await get_tg_note(self.telegram_id)
        self.user = await get_user(self.telegram_id)
        self.lesson = await self.homework.aget_lesson()
        self.plan = None
        if self.lesson:
            self.plan = await self.lesson.aget_learning_plan()
        self.user_roles = {
            "is_listener": self.homework.listener == self.user,
            "is_teacher": self.homework.teacher == self.user,
            "is_methodist": self.plan and self.plan.metodist == self.user,
            "is_curator": self.homework.for_curator and self.plan and (await self.plan.curators.filter(id=self.user.id).aexists())
        }
        self.homework_last_log = await self.homework.aget_status(True) if self.user_roles.get("is_listener") \
            else await self.homework.aget_status(False)

    def init_homework(self) -> None:
        self.homework = Homework.objects.select_related("listener").select_related("teacher").get(pk=self.homework_id)
        self.telegram_note = Telegram.objects.select_related("user").get(tg_id=self.telegram_id)
        self.user = self.telegram_note.user
        self.lesson = self.homework.get_lesson()
        self.plan = None
        if self.lesson:
            self.plan = self.lesson.get_learning_plan()
        self.user_roles = {
            "is_listener": self.homework.listener == self.user,
            "is_teacher": self.homework.teacher == self.user,
            "is_methodist": self.plan and self.plan.metodist == self.user,
            "is_curator": self.homework.for_curator and self.plan and (self.plan.curators.filter(id=self.user.id).exists())
        }
        self.homework_last_log = self.homework.get_status(accepted_only=True) if self.user_roles.get("is_listener") \
            else self.homework.get_status(accepted_only=False)

    async def send_materials(self) -> None:
        materials = [_ async for _ in self.homework.materials.all().order_by("uploaded_at")]
        if materials:
            delete_settings = None if self.user_roles["is_listener"] else {"action": "hw", "id": self.homework_id}
            for material in materials:
                await send_material_item(self.telegram_id, material, meta=False, delete_settings=delete_settings)

    async def _show_log_item(self, log_id: int) -> None:
        async def get_edit_perm() -> bool:
            if log.status not in [4, 5]:
                return False
            if log.user == self.user:
                return True
            return True if self.plan and self.plan.metodist == self.user else False

        async def send_files() -> None:
            files = [_ async for _ in log.files.all()]
            if len(files) > 0:
                for file in files:
                    rm = get_hw_log_delete_file_button(log.id, file.id) if edit_perm else None
                    await send_file(self.telegram_id, file, rm)

        log = await HomeworkLog.objects.select_related("user").select_related("homework").aget(pk=log_id)
        comment = log.comment.replace('<br>', '\n') if log.comment else '-'
        edit_perm = await get_edit_perm()
        rm_text = get_hw_log_edit_button(log.id) if edit_perm else None
        msg = (
            f"<b>{log.user}: {status_code_to_string(log.status)}</b> - {log.dt.astimezone().strftime('%d.%m %H:%M')}\n\n"
            f"{comment}\n")
        await bot.send_message(chat_id=self.telegram_id,
                               text=msg,
                               reply_markup=rm_text)
        await send_files()

    async def send_last_log(self) -> None:
        if self.user_roles["is_listener"]:
            logs = [{"status": log.status,
                     "id": log.id} async for log in self.homework.log.filter(
                Q(agreement__accepted=True,
                  status__in=[3, 4, 5]) |
                Q(agreement={},
                  status__in=[3, 4, 5])
            ).order_by("-dt")]
        else:
            logs = [{"status": log.status,
                     "id": log.id} async for log in self.homework.log.order_by("-dt")]
        last_logs = []
        for log in logs:
            if last_logs:
                if log["status"] == last_logs[-1]["status"]:
                    last_logs.append(log)
                else:
                    break
            else:
                last_logs.append(log)
        if last_logs:
            await bot.send_message(chat_id=self.telegram_id,
                                   text="Последний ответ:")
        for log in [l["id"] for l in last_logs]:
            await self._show_log_item(log)

    async def send_actions(self, materials_button) -> None:
        async def get_check_button() -> bool:
            if self.homework_last_log.status not in [3, 5]:
                return False
            if self.user_roles.get("is_teacher"):
                return True
            if self.plan:
                return self.user_roles.get("is_methodist") or self.user_roles.get("is_curator")
            return False

        async def get_agreement_buttons() -> bool:
            if self.user_roles.get("is_methodist"):
                return self.homework_last_log.agreement.get("accepted") is False
            else:
                return False

        async def get_edit_hw_button() -> bool:
            if self.homework_last_log.status not in [1, 2, 3, 5, 7]:
                return False
            return (self.user_roles.get("is_teacher") or
                    self.user_roles.get("is_methodist") or
                    self.user_roles.get("is_curator"))

        mat_button = materials_button
        send_button = self.homework_last_log.status in [2, 3, 5, 7] and self.user_roles.get("is_listener")
        agreement_buttons = await get_agreement_buttons()
        check_button = False if agreement_buttons else (await get_check_button())
        edit_hw_button = await get_edit_hw_button()
        rm = get_homework_item_buttons(hw_id=self.homework_id,
                                       mat_button=mat_button,
                                       send_button=send_button,
                                       check_button=check_button,
                                       agreement_buttons=agreement_buttons,
                                       edit_hw_button=edit_hw_button,
                                       tg_note=self.telegram_note)

        await bot.send_message(chat_id=self.telegram_id,
                               text="Выберите действие",
                               reply_markup=rm)

    async def add_materials(self, state: FSMContext) -> None:
        await state.set_data({
            "new_hw": {
                "hw_id": self.homework_id,
                "listener_id": self.homework.listener.id,
                "name": self.homework.name,
                "description": self.homework.description,
                "materials": [m.id async for m in self.homework.materials.all()],
                "deadline": {
                    'day': self.homework.deadline.day,
                    'month': self.homework.deadline.month,
                    'year': self.homework.deadline.year
                } if self.homework.deadline else None,
            },
            "messages_to_delete": []
        })
        await bot.send_message(
            chat_id=self.telegram_id,
            text="Перешлите сюда или прикрепите материал, или напишите сообщение\n"
                 "Когда будет готово, нажмите кнопку <b>'Подтвердить ДЗ'</b>",
            reply_markup=get_homework_editing_buttons()
        )
        await state.set_state(HomeworkNewFSM.change_menu)

    async def show_homework(self, mat_send=None):
        msgtext = f"ДЗ <b>{self.homework.name}</b>\n"
        if self.homework.description:
            msgtext += f"{self.homework.description}\n"
        await bot.send_message(chat_id=self.telegram_id, text=msgtext)
        mat_exists = await self.homework.materials.aexists()
        if mat_send is None and mat_exists:
            mat_send = self.telegram_note.setting_show_hw_materials
        if mat_send and mat_exists:
            await bot.send_message(chat_id=self.telegram_id,
                                   text="Материалы к ДЗ:")
            await self.send_materials()
        await self.send_last_log()
        await self.send_actions(not mat_send and mat_exists)

    async def send_link(self, message: str = "Вам направлено ДЗ"):
        homeworks = [{
            'name': self.homework.name,
            'status': None,
            'id': self.homework_id
        }]
        await bot.send_message(chat_id=self.telegram_id,
                               text=message,
                               reply_markup=get_homeworks_buttons(homeworks))


class AsyncClass:
    async def open_hw_in_tg(self, hw: TGHomework) -> None:
        await hw.show_homework()

    async def edit_hw_in_tg(self, hw: TGHomework,
                            state: FSMContext) -> None:
        await hw.add_materials(state=state)

    async def send_hw_to_tg(self, hw: TGHomework,
                            message: str) -> None:
        await hw.send_link(message)


sync_funcs = sync.methods(AsyncClass())


def open_homework_in_tg(telegram_id: int,
                        homework_id: int) -> None:
    hw = TGHomework(telegram_id=telegram_id,
                    homework_id=homework_id)
    hw.init_homework()
    sync_funcs.open_hw_in_tg(hw=hw)


def edit_homework_in_tg(telegram_id: int,
                        homework_id: int) -> None:
    hw = TGHomework(telegram_id=telegram_id,
                    homework_id=homework_id)
    hw.init_homework()
    state: FSMContext = FSMContext(
        storage=dp.storage,
        key=StorageKey(
            chat_id=telegram_id,
            user_id=telegram_id,
            bot_id=bot.id))
    sync_funcs.edit_hw_in_tg(hw=hw,
                             state=state)


def send_link_to_tg(telegram_id: int,
                    homework_id: int,
                    message: str = None) -> None:
    hw = TGHomework(telegram_id=telegram_id,
                    homework_id=homework_id)
    hw.init_homework()
    sync_funcs.send_hw_to_tg(hw=hw,
                             message=message)
