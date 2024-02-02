__all__ = ("router", )

from aiogram import Router
from .commands import router as router_commands

router = Router()
router.include_routers(router_commands)
