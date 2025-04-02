from datetime import datetime
from rest_framework import serializers
from homework.models import HomeworkLog
from material.serializers import MaterialLogSerializer, FileLogSerializer
from tgbot.models import TgBotJournal
from chat.models import Message
from lesson.models import LessonTeacherReview
from .models import UserLog
from profile_management.serializers import NewUserNameOnlyListSerializer
from .utils import get_role_from_plan


class UserLogsHWLogsSerializer(serializers.ModelSerializer):
    user = NewUserNameOnlyListSerializer(many=False, read_only=True)
    title = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    buttons = serializers.SerializerMethodField()
    files = FileLogSerializer(many=True, read_only=True)

    class Meta:
        model = HomeworkLog
        fields = ["title", "content", "user", "date", "buttons", "files"]

    def get_title(self, obj):
        role = get_role_ru(get_role_from_plan(self.context['plan'], obj.user))
        action = get_action_str_from_hw_log_status(obj.status)
        totalstr = f'{role} {action} "{obj.homework.name}"'
        lesson = obj.homework.lesson_set.first()
        if lesson:
            totalstr += f' к занятию "{lesson.name}" от {lesson.date.strftime("%d.%m")}'
        return totalstr

    def get_content(self, obj):
        return {"text": [obj.comment],
                "list": []}

    def get_date(self, obj):
        return obj.dt

    def get_buttons(self, obj):
        buttons = [{"inner": obj.homework.name,
                    "href": f"/homeworks/{obj.homework.id}"}]
        lesson = obj.homework.lesson_set.first()
        if lesson:
            buttons.append({"inner": "Занятие",
                            "href": f"/lessons/{lesson.id}"})
        return buttons


class UserLogsTGBotJournalSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    buttons = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    class Meta:
        model = TgBotJournal
        fields = ["title", "content", "user", "date", "buttons", "files"]

    def get_notification_status(self, obj):
        if obj.data.get("status") == 'success':
            tgnote = obj.recipient.telegram.first()
            if tgnote and tgnote.last_message_from_user_id and obj.data.get("msg_id"):
                if obj.data.get("msg_id") <= tgnote.last_message_from_user_id:
                    return "возможно прочитано"
                else:
                    return "доставлено"
            else:
                return "доставлено"
        return "не доставлено"

    def get_title(self, obj):
        role = get_role_ru(get_role_from_plan(self.context['plan'], obj.recipient), "g", True)
        return f"Уведомление для {role}"

    def get_content(self, obj):
        list_data = []
        if obj.initiator:
            list_data.append({
                "name": "Инициатор",
                "val": f'<a target="_blanl" href="/profile/{obj.initiator.id}">{obj.initiator.first_name} {obj.initiator.last_name}</a>'
            })
        list_data.append({
            "name": "Статус",
            "val": self.get_notification_status(obj)
        })
        if obj.data.get("text"):
            list_data.append({
                "name": "Текст уведомления",
                "val": obj.data.get("text")
            })
        for err in obj.data.get("errors"):
            list_data.append({
                "name": "Ошибка",
                "val": err
            })

        return {"text": ["Системой было направлено уведомление в Telegram"],
                "list": list_data}

    def get_user(self, obj):
        return NewUserNameOnlyListSerializer(obj.recipient, many=False).data

    def get_date(self, obj):
        return obj.dt

    def get_buttons(self, obj):
        return []

    def get_files(self, obj):
        return []


class UserLogsMessageSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    buttons = serializers.SerializerMethodField()
    files = FileLogSerializer(many=True, read_only=True)
    date = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["title", "content", "user", "date", "buttons", "files"]

    def get_title(self, obj):
        role_sender = get_role_ru(get_role_from_plan(self.context['plan'], obj.sender))
        role_receiver = get_role_ru(get_role_from_plan(self.context['plan'], obj.receiver), "d", True)
        return f"{role_sender} отправил сообщение {role_receiver}"

    def get_content(self, obj):
        list_data = []
        text = [obj.message] if obj.message else []
        return {"text": text,
                "list": list_data}

    def get_user(self, obj):
        return NewUserNameOnlyListSerializer(obj.receiver, many=False).data

    def get_date(self, obj):
        return obj.date

    def get_buttons(self, obj):
        return []


class UserLogsLessonReviewSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    buttons = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()

    class Meta:
        model = LessonTeacherReview
        fields = ["title", "content", "user", "date", "buttons", "files", "color"]

    def get_title(self, obj):
        lesson = obj.lesson_set.first()
        return f"Занятие {lesson.name} от {lesson.date.strftime('%d.%m.%Y')} проведено"

    def get_color(self, obj):
        return "success"

    def get_content(self, obj):
        list_data = []
        if obj.materials:
            list_data.append({
                "name": "Используемые материалы",
                "val": obj.materials
            })
        if obj.lexis:
            list_data.append({
                "name": "Лексика",
                "val": obj.lexis
            })
        if obj.grammar:
            list_data.append({
                "name": "Грамматика",
                "val": obj.grammar
            })
        if obj.note:
            list_data.append({
                "name": "Примечание",
                "val": obj.note
            })
        if obj.org:
            list_data.append({
                "name": "Орг. моменты и поведение ученика",
                "val": obj.org
            })
        return {"text": [],
                "list": list_data}

    def get_user(self, obj):
        lesson = obj.lesson_set.first()
        lp = lesson.get_learning_plan()
        return NewUserNameOnlyListSerializer(lp.teacher, many=False).data

    def get_date(self, obj):
        if obj.dt:
            return obj.dt
        else:
            lesson = obj.lesson_set.first()
            return datetime.combine(lesson.date, lesson.end_time)

    def get_files(self, obj):
        return []

    def get_buttons(self, obj):
        return [{"inner": "Занятие",
                 "href": f"/lessons/{obj.lesson_set.first().id}"}]


class UserLogsSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    user = NewUserNameOnlyListSerializer(many=False)
    files = serializers.SerializerMethodField()

    class Meta:
        model = UserLog
        fields = ["title", "content", "user", "date", "buttons", "files", "color"]

    def get_date(self, obj):
        return obj.date

    def get_files(self, obj):
        result = []
        materials = obj.materials_db.all()
        files = obj.files_db.all()
        if materials:
            result.extend(MaterialLogSerializer(materials, many=True).data)
        if files:
            result.extend(FileLogSerializer(files, many=True).data)
        return result


def get_role_ru(role: str, case: str = 'n', lc: bool = False):
    roles = {
        "Admin": {
            "n": "Администратор",
            "g": "Администратора",
            "d": "Администратору",
            "a": "Администратора",
            "c": "Администратором",
            "p": "Администраторе",
        },
        "Metodist": {
            "n": "Методист",
            "g": "Методиста",
            "d": "Методисту",
            "a": "Матедиста",
            "c": "Методистом",
            "p": "Методисте",
        },
        "Teacher": {
            "n": "Преподаватель",
            "g": "Преподавателя",
            "d": "Преподавателю",
            "a": "Преподавателя",
            "c": "Преподавателем",
            "p": "Преподавателе",
        },
        "Curator": {
            "n": "Куратор",
            "g": "Куратора",
            "d": "Куратору",
            "a": "Куратора",
            "c": "Куратором",
            "p": "Кураторе",
        },
        "Listener": {
            "n": "Ученик",
            "g": "Ученика",
            "d": "Ученику",
            "a": "Ученика",
            "c": "Учеником",
            "p": "Ученике",
        }
    }
    return roles[role][case].lower() if lc else roles[role][case]


def get_action_str_from_hw_log_status(st: int):
    if st == 1:
        return "создал"
    elif st == 2:
        return "открыл"
    elif st == 3:
        return "отправил на проверку"
    elif st == 4:
        return "принял"
    elif st == 5:
        return "отправил на доработку"
    elif st == 6:
        return "отменил"
    elif st == 7:
        return "задал"
    else:
        return ""
