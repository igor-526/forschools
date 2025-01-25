from learning_plan.models import LearningPlan
from profile_management.models import NewUser


def get_role_from_plan(plan: LearningPlan, user: NewUser) -> str:
    if user in [plan.teacher, plan.default_hw_teacher]:
        return 'Teacher'
    if user == plan.metodist:
        return 'Metodist'
    if plan.listeners.filter(id=user.id).exists():
        return 'Listener'
    if plan.curators.filter(id=user.id).exists():
        return 'Curator'
    if user.groups.filter(name="Admin").exists():
        return 'Admin'
    return user.groups.first().name


async def aget_role_from_plan(plan: LearningPlan, user: NewUser) -> str:
    if user in [plan.teacher, plan.default_hw_teacher]:
        return 'Teacher'
    if user == plan.metodist:
        return 'Metodist'
    if await plan.listeners.filter(id=user.id).aexists():
        return 'Listener'
    if await plan.curators.filter(id=user.id).aexists():
        return 'Curator'
    if await user.groups.filter(name="Admin").aexists():
        return 'Admin'
    return (await user.groups.afirst()).name
