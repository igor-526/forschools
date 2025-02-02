import datetime
from learning_program.models import LearningProgram
from learning_plan.models import LearningPlan, LearningPhases
from lesson.models import Lesson, Place


def plan_calculated_info(date: datetime.datetime, schedule: dict, program: LearningProgram) -> dict:
    info = program.get_all_info()
    counter = info.get("lessons")
    last_date = None
    total_hours = 0
    days = schedule.keys()
    while counter > 0:
        if date.weekday() in days:
            last_date = date
            st = datetime.datetime.strptime(
                schedule.get(date.weekday()).get("start"),
                "%H:%M",
            )
            et = datetime.datetime.strptime(
                schedule.get(date.weekday()).get("end"),
                "%H:%M",
            )
            total_hours += (et - st).seconds / (60 * 60)
            counter -= 1
        date = date + datetime.timedelta(days=1)
    return {
        "info": info,
        "last_date": last_date,
        "total_hours": total_hours // 1
    }


def plan_rescheduling_info(date: datetime, schedule: dict, lesson: Lesson) -> dict:
    counter = Lesson.objects.filter(date__gte=lesson.date).count()
    counter2 = counter
    last_date = None
    total_hours = 0
    days = schedule.keys()
    while counter > 0:
        if date.weekday() in days:
            last_date = date
            st = datetime.datetime.strptime(
                schedule.get(date.weekday()).get("start"),
                "%H:%M",
            )
            et = datetime.datetime.strptime(
                schedule.get(date.weekday()).get("end"),
                "%H:%M",
            )
            total_hours += (et - st).seconds / (60 * 60)
            counter -= 1
        date = date + datetime.timedelta(days=1)
    return {
        "count": counter2,
        "last_date": last_date,
        "total_hours": total_hours // 1
    }


def get_schedule(data):
    schedule = {}
    if data.get("monday"):
        schedule[0] = {
            "start": data.get("monday_start"),
            "end": data.get("monday_end")
        }
        place = data.get("monday_place")
        schedule[0]["place"] = place if place != "None" else None
    if data.get("tuesday"):
        schedule[1] = {
            "start": data.get("tuesday_start"),
            "end": data.get("tuesday_end")
        }
        place = data.get("tuesday_place")
        schedule[1]["place"] = place if place != "None" else None
    if data.get("wednesday"):
        schedule[2] = {
            "start": data.get("wednesday_start"),
            "end": data.get("wednesday_end")
        }
        place = data.get("wednesday_place")
        schedule[2]["place"] = place if place != "None" else None
    if data.get("thursday"):
        schedule[3] = {
            "start": data.get("thursday_start"),
            "end": data.get("thursday_end")
        }
        place = data.get("thursday_place")
        schedule[3]["place"] = place if place != "None" else None
    if data.get("friday"):
        schedule[4] = {
            "start": data.get("friday_start"),
            "end": data.get("friday_end")
        }
        place = data.get("friday_place")
        schedule[4]["place"] = place if place != "None" else None
    if data.get("saturday"):
        schedule[5] = {
            "start": data.get("saturday_start"),
            "end": data.get("saturday_end")
        }
        place = data.get("saturday_place")
        schedule[5]["place"] = place if place != "None" else None
    if data.get("sunday"):
        schedule[6] = {
            "start": data.get("sunday_start"),
            "end": data.get("sunday_end")
        }
        place = data.get("sunday_place")
        schedule[6]["place"] = place if place != "None" else None
    return schedule


class ProgramSetter:
    last_date: datetime
    program: LearningProgram
    schedule: dict

    def __init__(self,
                 first_date: datetime,
                 schedule: dict,
                 program: LearningProgram,
                 plan: LearningPlan):
        self.last_date = first_date
        self.schedule = schedule
        self.program = program
        self.plan = plan

    def get_next_date(self, show=False) -> dict:
        ld = self.last_date
        while ld.weekday() not in self.schedule.keys():
            ld = ld + datetime.timedelta(days=1)
        result = {
            "date": ld,
            "start": self.schedule.get(ld.weekday()).get("start"),
            "end": self.schedule.get(ld.weekday()).get("end"),
        }
        if not show:
            self.last_date = ld + datetime.timedelta(days=1)
        return result

    def get_plan_dict(self):
        plan = [self.program.phases.get(pk=phase) for phase in self.program.phases_order]
        plan = [{
            'object': phase,
            'lessons': [phase.lessons.get(pk=lesson) for lesson in phase.lessons_order],
        } for phase in plan]

        for key, phase in enumerate(plan):
            lessons = phase.get("lessons")
            lessons = [{
                'object': lesson,
                'homeworks': [{"object": hw,
                               "deadline": self.get_next_date(show=True).get("date") +
                                           datetime.timedelta(days=3)}
                              for hw in lesson.homeworks.all()],
                'dt': self.get_next_date()
            } for lesson in lessons]

            plan[key]["lessons"] = lessons

        return plan

    def set_program(self):
        plan = self.get_plan_dict()
        self.plan.schedule = self.schedule
        self.plan.from_program = self.program
        self.plan.save()
        for phase_dict in plan:
            pr_phase = phase_dict.get("object")
            lp_phase = self.plan.phases.create(
                name=pr_phase.name,
                purpose=pr_phase.purpose
            )
            lessons = phase_dict.get("lessons")
            for lesson_dict in lessons:
                pr_lesson = lesson_dict.get("object")
                lp_lesson_date = lesson_dict.get("dt").get("date")
                lp_lesson = lp_phase.lessons.create(
                    name=pr_lesson.name,
                    description=pr_lesson.description,
                    date=lp_lesson_date,
                    start_time=lesson_dict.get("dt").get("start"),
                    end_time=lesson_dict.get("dt").get("end"),
                    from_program_lesson_id=pr_lesson.id,
                    place_id=self.schedule[lp_lesson_date.weekday()]["place"]
                )
                lp_lesson.materials.set(pr_lesson.materials.all())
                lp_lesson.save()
                homeworks = lesson_dict.get("homeworks")
                for homework in homeworks:
                    for listener in self.plan.listeners.all():
                        lp_hw = lp_lesson.homeworks.create(
                            name=homework.get("object").name,
                            description=homework.get("object").description,
                            teacher=self.plan.teacher,
                            listener=listener,
                            from_programs_hw_id=homework.get("object").id,
                            deadline=homework.get("deadline")
                        )
                        lp_hw.materials.set(homework.get("object").materials.all())
                        lp_hw.save()


class Rescheduling:
    last_date: datetime
    lessons: list
    schedule: dict

    def __init__(self,
                 first_date: datetime,
                 lessons: list,
                 schedule: dict):
        self.last_date = first_date
        self.schedule = schedule
        self.lessons = lessons

    def get_next_date(self, show=False) -> dict:
        ld = self.last_date
        while ld.weekday() not in self.schedule.keys():
            ld = ld + datetime.timedelta(days=1)
        result = {
            "date": ld,
            "start": self.schedule.get(ld.weekday()).get("start"),
            "end": self.schedule.get(ld.weekday()).get("end"),
        }
        if not show:
            self.last_date = ld + datetime.timedelta(days=1)
        return result

    def set_hw_deadline(self, homeworks, date):
        for hw in homeworks:
            hw.deadline = date
            hw.save()

    def set_lessons_dt(self):
        for lesson in self.lessons:
            new_dt = self.get_next_date(False)
            hw_date = self.get_next_date(True)['date']
            lesson.date = new_dt['date']
            lesson.start_time = new_dt['start']
            lesson.end_time = new_dt['end']
            place_id = self.schedule[new_dt['date'].weekday()]["place"]
            if place_id:
                lesson.place = Place.objects.get(pk=place_id)
            else:
                lesson.place = None
            lesson.save()
            self.set_hw_deadline(lesson.homeworks.all(), hw_date)


class AddLessons:
    last_date: datetime
    schedule: dict
    plan: LearningPlan
    lessons_count: int
    last_lesson_date: datetime

    def __init__(self,
                 first_date: datetime,
                 schedule: dict,
                 plan: LearningPlan,
                 lessons_count: int = None,
                 last_lesson_date: datetime = None
                 ):
        self.last_date = first_date
        self.schedule = schedule
        self.plan = plan
        self.lessons_count = lessons_count
        self.last_lesson_date = last_lesson_date

    def get_next_date(self, show=False) -> dict:
        ld = self.last_date
        while ld.weekday() not in self.schedule.keys():
            ld = ld + datetime.timedelta(days=1)
        result = {
            "date": ld,
            "start": self.schedule.get(ld.weekday()).get("start"),
            "end": self.schedule.get(ld.weekday()).get("end")
        }
        if not show:
            self.last_date = ld + datetime.timedelta(days=1)
        return result

    def get_phase(self):
        plan_phases = self.plan.phases.order_by("-pk").first()
        if plan_phases:
            return plan_phases
        phase = LearningPhases.objects.create(
            name="Этап 1",
            purpose="Без цели"
        )
        self.plan.phases.add(phase)
        self.plan.save()
        return phase

    def get_next_lesson_break(self, counter: int = None, next_date: datetime = None):
        if self.last_lesson_date and next_date > self.last_lesson_date:
            return True
        if self.lessons_count and counter > self.lessons_count:
            return True
        if counter > 200:
            return True
        return False

    def add_lessons(self):
        phase = self.get_phase()
        counter = 1
        while True:
            next_date = self.get_next_date(False)
            if self.get_next_lesson_break(counter, next_date.get('date')):
                break
            phase.lessons.create(
                name=f'Занятие {counter}',
                start_time=next_date.get("start"),
                end_time=next_date.get("end"),
                date=next_date.get("date"),
                place_id=self.schedule[next_date.get("date").weekday()]["place"]
            )
            counter += 1
