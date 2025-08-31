from rest_framework import serializers

from lesson.models import Lesson


class LessonDashboardSerializer(serializers.ModelSerializer):
    titles = serializers.SerializerMethodField()
    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ["id", "titles", "start", "end"]

    @staticmethod
    def get_titles(obj):
        lp = obj.learningphases_set.first().learningplan_set.select_related("teacher").first()
        name = obj.name_fact if obj.name_fact else obj.name
        teacher = obj.replace_teacher if obj.replace_teacher else lp.teacher
        teacher = f'{teacher.first_name} {teacher.last_name}'
        listeners = list(lp.listeners.values_list("first_name", "last_name").all())
        listeners.extend(list(obj.additional_listeners.values_list("first_name", "last_name").all()))
        listeners = ', '.join([f'{listener[0]} {listener[1]}' for listener in listeners])
        return {
            'name': name,
            'teacher': teacher,
            'listeners': listeners,
        }

    @staticmethod
    def get_start(obj):
        return obj.start_dt

    @staticmethod
    def get_end(obj):
        return obj.end_dt