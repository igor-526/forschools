from datetime import datetime, timedelta, time
from learning_program.models import LearningProgram
from learning_plan.models import LearningPlan


def plan_calculated_info(date: datetime, schedule: dict, program: LearningProgram) -> dict:
    info = program.get_all_info()
    counter = info.get("lessons")
    last_date = None
    total_hours = 0
    days = schedule.keys()
    while counter > 0:
        if date.weekday() in days:
            last_date = date
            st = datetime.strptime(
                schedule.get(date.weekday()).get("start"),
                "%H:%M",
            )
            et = datetime.strptime(
                schedule.get(date.weekday()).get("end"),
                "%H:%M",
            )
            total_hours += (et - st).seconds / (60 * 60)
            counter -= 1
        date = date + timedelta(days=1)
    return {
        "info": info,
        "last_date": last_date,
        "total_hours": total_hours//1
    }


class ProgramSetter:
    first_date: datetime
    last_date: datetime
    program: LearningProgram
    schedule: dict

    def __init__(self, first_date: datetime,
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
            ld = ld + timedelta(days=1)
        else:
            result = {
                "date": ld,
                "start": self.schedule.get(ld.weekday()).get("start"),
                "end": self.schedule.get(ld.weekday()).get("end"),
            }
            if not show:
                self.last_date = ld + timedelta(days=1)
            return result

    def get_plan_dict(self):
        plan = [self.program.phases.get(pk=phase) for phase in self.program.phases_order]
        plan = [{
            'object': phase,
            'lessons': [phase.lessons.get(pk=lesson) for lesson in phase.lessons_order],
        } for phase in plan]

        for key, phase in enumerate(plan):
            lessons = (phase.get("lessons"))
            lessons = [{
                'object': lesson,
                'homeworks': [{"object": hw,
                               "deadline": self.get_next_date(show=True).get("date") + timedelta(days=3)} for hw in lesson.homeworks.all()],
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
                lp_lesson = lp_phase.lessons.create(
                    name=pr_lesson.name,
                    description=pr_lesson.description,
                    date=lesson_dict.get("dt").get("date"),
                    start_time=lesson_dict.get("dt").get("start"),
                    end_time=lesson_dict.get("dt").get("end")
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
                            deadline=homework.get("deadline")
                        )
                        lp_hw.materials.set(homework.get("object").materials.all())
                        lp_hw.save()
