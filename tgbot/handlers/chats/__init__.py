__all__ = ("router", )

from aiogram import Router
from .actions import router as router_actions

router = Router()
router.include_routers(router_actions)
