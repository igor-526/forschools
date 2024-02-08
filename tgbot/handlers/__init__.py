__all__ = ("router", )

from aiogram import Router
from .commands import router as router_commands
from .add_lesson import router as router_add_lesson
from .add_hw import router as router_add_hw

router = Router()
router.include_routers(router_commands,
                       router_add_lesson,
                       router_add_hw)
