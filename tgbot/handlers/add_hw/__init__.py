__all__ = ("router", )

from aiogram import Router
from .name import router as router_name
from .lesson import router as router_lesson

router = Router()
router.include_routers(router_name,
                       router_lesson)
