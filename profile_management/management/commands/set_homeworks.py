from django.core.management.base import BaseCommand

from homework.models import Homework, HomeworkLog
from lesson.models import Lesson


class Command(BaseCommand):
    help = 'This command will setup groups and permissions'

    def handle(self, *args, **kwargs):
        counter = 0
        lessons = Lesson.objects.filter(status=1)
        for lesson in lessons:
            homeworks = lesson.homeworks.all()
            for homework in homeworks:
                if homework.get_status().status == 1:
                    homework.set_assigned()
                    counter += 1
        print(counter)
