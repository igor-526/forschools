from rest_framework import serializers
from learning_plan.permissions import get_can_see_plan
from lesson.models import Lesson
from profile_management.serializers import NewUserNameOnlyListSerializer
from profile_management.models import NewUser
from material.serializers import MaterialListSerializer
from material.serializers import FileSerializer
from tgbot.utils import send_homework_answer_tg, send_homework_tg
from .permissions import get_delete_log_permission
from .models import Homework, HomeworkLog, HomeworkGroups


class HomeworkSerializer(serializers.ModelSerializer):
    listener = NewUserNameOnlyListSerializer()
    teacher = NewUserNameOnlyListSerializer()
    materials = MaterialListSerializer(many=True)
    lesson_info = serializers.SerializerMethodField(read_only=True)

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
                result['plan'] = {"id": plan.id,
                                  "teacher": NewUserNameOnlyListSerializer(plan.teacher,
                                                                           many=False).data,
                                  "listeners": NewUserNameOnlyListSerializer(plan.listeners.all(),
                                                                             many=True).data,
                                  "curators": NewUserNameOnlyListSerializer(plan.curators.all(),
                                                                            many=True).data,
                                  "methodist": NewUserNameOnlyListSerializer(plan.metodist,
                                                                             many=False).data}
            return result
        return None


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
        status = obj.get_status(accepted_only=obj.listener == self.context.get("request").user)
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
        hw_status = obj.get_status(accepted_only=obj.listener == self.context.get("request").user)
        if hw_status.status == 6:
            color = "danger"
        elif hw_status.status == 4:
            color = "success"
        user_groups = [g.name for g in self.context.get("request").user.groups.all()]
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
                if lesson.get_learning_plan().curators.filter(id=request.user.id).exists():
                    validated_data['for_curator'] = True
                if lesson.status != 1:
                    set_assigned = False
                listeners = lesson.get_listeners()
                teacher = lesson.get_hw_teacher()
            except Lesson.DoesNotExist:
                raise serializers.ValidationError({"msg": "Занятие отсутствует"})
        else:
            try:
                lesson = None
                listeners = NewUser.objects.filter(groups__name="Listener",
                                                   id__in=request.POST.getlist("listeners"))
                if not listeners:
                    raise serializers.ValidationError({"listeners": "Ученики не найдены"})
                teacher = NewUser.objects.get(groups__name="Teacher",
                                              id=request.POST.get("teacher"))
            except NewUser.DoesNotExist:
                raise serializers.ValidationError({"teacher": "Преподаватель не найден"})
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
            homework.materials.set(self.context.get('request').POST.getlist('materials'))
            homework.save()
            if set_assigned:
                res = homework.set_assigned()
                if res.get("agreement") is not None and res.get("agreement") is False:
                    send_homework_tg(request.user, homework.listener, [homework])
                else:
                    send_homework_tg(initiator=homework.teacher,
                                     listener=homework.get_lesson().get_learning_plan().metodist,
                                     homeworks=[homework],
                                     text="Требуется согласование действия преподавталя")
        if len(homeworks) > 1:
            hw_group = HomeworkGroups.objects.create()
            hw_group.homeworks.add(*homeworks)
        return homeworks[0]


class HomeworkLogListSerializer(serializers.ModelSerializer):
    user = NewUserNameOnlyListSerializer(many=False, read_only=True)
    files = FileSerializer(many=True, read_only=True)

    class Meta:
        model = HomeworkLog
        fields = ["id", "user", "comment", "status", "dt", "agreement", "files"]

    def create(self, validated_data):
        def cr_obj(accepting=False):
            if accepting:
                hwlog = HomeworkLog.objects.create(**validated_data,
                                                   user=self.context.get("request").user,
                                                   homework_id=self.context.get("hw_id"),
                                                   agreement={
                                                       "accepted_dt": None,
                                                       "accepted": False
                                                   })
            else:
                hwlog = HomeworkLog.objects.create(**validated_data,
                                                   user=self.context.get("request").user,
                                                   homework_id=self.context.get("hw_id"))
            return hwlog

        hw = Homework.objects.get(pk=self.context.get("hw_id"))
        metodist = hw.get_lesson().get_learning_plan().metodist
        if metodist:
            if (self.context.get("request").user.groups.filter(name="Admin").exists() or
                    hw.get_lesson().get_learning_plan().metodist ==
                    self.context.get("request").user):
                hwl = cr_obj(accepting=False)
                send_homework_answer_tg(hwl.homework.listener, hwl.homework, hwl.status)
            else:
                hwl = cr_obj(accepting=True)
                send_homework_tg(initiator=hwl.homework.teacher,
                                 listener=hwl.homework.get_lesson().get_learning_plan().metodist,
                                 homeworks=[hwl.homework],
                                 text="Требуется согласование действия преподавателя")

        else:
            hwl = cr_obj(accepting=False)
            send_homework_answer_tg(hwl.homework.listener, hwl.homework, hwl.status)
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
