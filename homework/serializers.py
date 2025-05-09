from typing import List
from rest_framework import serializers
from learning_plan.models import LearningPlan
from learning_plan.permissions import get_can_see_plan
from lesson.models import Lesson
from profile_management.serializers import NewUserNameOnlyListSerializer
from profile_management.models import NewUser
from material.serializers import MaterialListSerializer
from material.serializers import FileSerializer
from tgbot.utils import send_homework_answer_tg, send_homework_tg
from .permissions import get_delete_log_permission, get_can_accept_log_permission
from .models import Homework, HomeworkLog, HomeworkGroups


class HomeworkSerializer(serializers.ModelSerializer):
    listener = NewUserNameOnlyListSerializer()
    teacher = NewUserNameOnlyListSerializer()
    materials = MaterialListSerializer(many=True)
    lesson_info = serializers.SerializerMethodField(read_only=True)
    actions = serializers.SerializerMethodField()

    class Meta:
        model = Homework
        fields = '__all__'

    def get_lesson_info(self, obj):
        lesson = obj.get_lesson()
        if lesson:
            plan = lesson.get_learning_plan()
            result = {
                "id": lesson.id,
                "name": lesson.name,
            }
            if get_can_see_plan(self.context.get('request'), plan, lesson):
                result['plan'] = {
                    "id": plan.id,
                    "teacher": NewUserNameOnlyListSerializer(
                        plan.teacher,
                        many=False
                    ).data,
                    "listeners": NewUserNameOnlyListSerializer(
                        plan.listeners.all(),
                        many=True
                    ).data,
                    "curators": NewUserNameOnlyListSerializer(
                        plan.curators.all(),
                        many=True
                    ).data,
                    "methodist": NewUserNameOnlyListSerializer(
                        plan.metodist,
                        many=False
                    ).data
                }
            return result
        return None

    def get_actions(self, obj: Homework):
        def get_agreement_actions(last_log_: HomeworkLog) -> List[str]:
            if not last_log_.agreement.get("accepted") is False:
                return []
            if get_can_accept_log_permission(obj, self.context.get('request')):
                return ["agreement"]
            return []

        def get_send_actions(last_log_: HomeworkLog, plan_: LearningPlan) -> List[str]:
            if ((last_log_.status in [1, 2, 3, 5, 7]) and
                    obj.listener == self.context.get("request").user):
                return ["send"]
            hw_status = last_log_.status in [3, 5, 7]
            if not hw_status:
                return []
            if (obj.teacher == self.context.get("request").user or
                    (plan_ and plan_.metodist == self.context.get("request").user) or
                    (plan_ and plan_.curators.filter(id=self.context.get("request").user.id).exists())):
                return ["check"]
            return []

        def get_cancel_actions(last_log_: HomeworkLog, plan_: LearningPlan) -> List[str]:
            hw_status = last_log_.status in [1, 2, 3, 5, 7]
            if not hw_status:
                return []
            if (obj.teacher == self.context.get("request").user or
                    (plan_ and plan_.metodist == self.context.get("request").user) or
                    self.context.get("request").user.groups.filter(name__in=["Admin"]).exists()):
                return ["cancel"]
            return []

        def get_edit_actions(last_log_: HomeworkLog, plan_: LearningPlan) -> List[str]:
            if last_log_.status in [4, 6]:
                return []
            if (obj.teacher == self.context.get("request").user or
                    (plan_ and plan_.metodist == self.context.get("request").user) or
                    (obj.for_curator and
                     plan.curators.filter(id=self.context.get("request").user.id).exists())):
                return ["edit"]
            return []

        actions = []
        last_log = obj.get_status(
            accepted_only=self.context.get('request').user == obj.listener
        )
        lesson = obj.get_lesson()
        plan = lesson.get_learning_plan() if lesson else None
        actions.extend(get_agreement_actions(last_log))
        actions.extend(get_send_actions(last_log, plan))
        actions.extend(get_cancel_actions(last_log, plan))
        actions.extend(get_edit_actions(last_log, plan))
        return actions


class HomeworkListSerializer(serializers.ModelSerializer):
    teacher = NewUserNameOnlyListSerializer(many=False, read_only=True)
    listener = NewUserNameOnlyListSerializer(many=False, read_only=True)
    status = serializers.SerializerMethodField(read_only=True)
    lesson_info = serializers.SerializerMethodField(read_only=True)
    assigned = serializers.SerializerMethodField(read_only=True)
    color = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Homework
        fields = ["id", "name", "description", "teacher", "for_curator",
                  "listener", "status", "lesson_info", "assigned", "color"]

    def get_status(self, obj):
        status = obj.get_status(
            accepted_only=obj.listener == self.context.get("request").user
        )
        if status:
            return {"status": status.status,
                    "dt": status.dt}
        return None

    def get_lesson_info(self, obj):
        lesson = obj.get_lesson()
        if lesson:
            return {
                "id": lesson.id,
                "date": lesson.date,
                "name": lesson.name
            }
        return None

    def get_assigned(self, obj):
        status = obj.get_status(True)
        if status:
            return status.dt
        return None

    def get_color(self, obj):
        color = None
        hw_status = obj.get_status(
            accepted_only=obj.listener == self.context.get("request").user
        )
        if hw_status.status == 6:
            color = "danger"
        elif hw_status.status == 4:
            color = "success"
        user_groups = [g.name for g in
                       self.context.get("request").user.groups.all()]
        if "Admin" in user_groups or "Metodist" in user_groups:
            status_agreement = hw_status.agreement
            if (status_agreement.get("accepted") is not None and
                    not status_agreement.get("accepted")):
                color = "warning"
            elif status_agreement.get("accepted"):
                color = "info"
        if "Teacher" in user_groups or "Curator" in user_groups:
            if hw_status.status == 3:
                color = "warning"
        if "Listener" in user_groups and hw_status.status in [1, 2, 5]:
            color = "warning"
        return color

    def create(self, validated_data):
        request = self.context.get("request")
        lesson_id = request.POST.get('lesson')
        set_assigned = True
        if lesson_id:
            try:
                lesson = Lesson.objects.get(pk=int(lesson_id))
                if (lesson.get_learning_plan().curators
                        .filter(id=request.user.id).exists()):
                    validated_data['for_curator'] = True
                if lesson.status != 1:
                    set_assigned = False
                listeners = lesson.get_listeners()
                teacher = lesson.get_hw_teacher()
            except Lesson.DoesNotExist:
                raise serializers.ValidationError(
                    {"msg": "Занятие отсутствует"}
                )
        else:
            try:
                lesson = None
                listeners = NewUser.objects.filter(
                    groups__name="Listener",
                    id__in=request.POST.getlist("listeners")
                )
                if not listeners:
                    raise serializers.ValidationError(
                        {"listeners": "Ученики не найдены"}
                    )
                teacher = NewUser.objects.get(groups__name="Teacher",
                                              id=request.POST.get("teacher"))
            except NewUser.DoesNotExist:
                raise serializers.ValidationError(
                    {"teacher": "Преподаватель не найден"}
                )
        homeworks = []
        for listener in listeners:
            homework = Homework.objects.create(**validated_data,
                                               listener=listener,
                                               teacher=teacher)
            homeworks.append(homework)
        if lesson_id:
            lesson.homeworks.add(*homeworks)
            lesson.save()
        for homework in homeworks:
            homework.materials.set(
                self.context.get('request').POST.getlist('materials')
            )
            homework.save()
            if set_assigned:
                res = homework.set_assigned()
                if (res.get("agreement") is not None and
                        res.get("agreement") is False):
                    send_homework_tg(initiator=request.user,
                                     listener=homework.listener,
                                     homeworks=[homework])
                else:
                    send_homework_tg(
                        initiator=homework.teacher,
                        listener=(homework.get_lesson()
                                  .get_learning_plan().metodist),
                        homeworks=[homework],
                        text="Требуется согласование действия преподавталя"
                    )
        if len(homeworks) > 1:
            hw_group = HomeworkGroups.objects.create()
            hw_group.homeworks.add(*homeworks)
        return homeworks[0]


class HomeworkLogListSerializer(serializers.ModelSerializer):
    user = NewUserNameOnlyListSerializer(many=False, read_only=True)
    files = FileSerializer(many=True, read_only=True)
    editable = serializers.SerializerMethodField()
    deletable = serializers.SerializerMethodField()
    editable_logs = []
    deletable_logs = []

    class Meta:
        model = HomeworkLog
        fields = ["id", "user", "comment", "status", "dt",
                  "agreement", "files", "deletable", "editable"]

    def __init__(self, *args, **kwargs):
        super(HomeworkLogListSerializer, self).__init__(*args, **kwargs)
        if not args or args[0] is None:
            self.editable_logs = []
            self.deletable_logs = []
            return
        user_groups = self.context.get("request").user.groups.all().values_list("name", flat=True)
        self.editable_logs = self.get_editable_logs(args[0], user_groups)
        self.deletable_logs = self.get_deletable_logs(args[0], user_groups)

    def get_editable_logs(self, all_logs, user_groups):
        if "Admin" in user_groups:
            return []
        if all_logs[0].status in [1, 2, 6, 7]:
            return []
        last_logs = []
        for log in all_logs:
            if not last_logs:
                last_logs.append(log)
                continue
            if log.status == last_logs[-1].status:
                last_logs.append(log)
            else:
                break
        if "Metodist" in user_groups and last_logs[0].status in [4, 5]:
            return last_logs
        result = []
        for log in last_logs:
            if log.user == self.context.get("request").user:
                result.append(log)
        return result

    def get_deletable_logs(self, all_logs, user_groups):
        if all_logs[0].status in [1, 2, 7]:
            return []
        last_logs = []
        for log in all_logs:
            if not last_logs:
                last_logs.append(log)
                continue
            if log.status == last_logs[-1].status:
                last_logs.append(log)
            else:
                break
        if ("Metodist" in user_groups or "Admin" in user_groups) and last_logs[0].status in [4, 5, 6]:
            return last_logs
        result = []
        for log in last_logs:
            if log.user == self.context.get("request").user:
                result.append(log)
        return result

    def get_editable(self, obj: HomeworkLog):
        return obj in self.editable_logs

    def get_deletable(self, obj: HomeworkLog):
        return obj in self.deletable_logs

    def create(self, validated_data):
        def notify(hw_log: HomeworkLog, accepting=False) -> None:
            if hw_log.status == 3:
                print("Отправляем преподу")
                send_homework_answer_tg(
                    user=hw_log.homework.teacher,
                    homework=hw_log.homework,
                    status=hw_log.status
                )
                return None
            if hw_log.status in [4, 5] and accepting:
                send_homework_tg(
                    initiator=hw_log.homework.teacher,
                    listener=plan.metodist,
                    homeworks=[hw_log.homework],
                    text="Требуется согласование действия преподавателя"
                )
                return None
            if hw_log.status in [4, 5]:
                send_homework_answer_tg(
                    user=hw_log.homework.listener,
                    homework=hw_log.homework,
                    status=hw_log.status
                )
                return None
            return None

        def cr_obj(accepting=False):
            query = {
                "user": self.context.get("request").user,
                "homework_id": self.context.get("hw_id")
            }
            if accepting:
                query["agreement"] = {
                    "accepted_dt": None,
                    "accepted": False
                }
            hwlog = HomeworkLog.objects.create(
                **validated_data,
                **query
            )
            notify(hwlog, accepting)
            return hwlog

        hw = Homework.objects.get(pk=self.context.get("hw_id"))
        lesson = hw.get_lesson()
        plan = lesson.get_learning_plan() if lesson else None
        accepting_ = False
        if plan and plan.metodist:
            if not (self.context.get("request").user.groups
                            .filter(name="Admin").exists() or
                    plan.metodist == self.context.get("request").user or
                    hw.listener == self.context.get("request").user):
                accepting_ = True
        hwl = cr_obj(accepting=accepting_)
        if len(self.context.get("files")) > 0:
            hwl.files.set(self.context.get("files"))
            hwl.save()
        return hwl


class HomeworkLogSerializer(serializers.ModelSerializer):
    user = NewUserNameOnlyListSerializer(many=False, read_only=True)
    files = FileSerializer(many=True, read_only=True)
    deletable = serializers.SerializerMethodField()

    class Meta:
        model = HomeworkLog
        fields = ["id", "user", "files", "comment", "status",
                  "homework", "dt", "deletable", "agreement"]

    def get_deletable(self, obj):
        return get_delete_log_permission(obj, self.context.get("request"))
