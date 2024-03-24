__all__ = ("router", )

from aiogram import Router
from .commands import router as router_commands
from .materials import router as router_materials


router = Router()
router.include_routers(router_commands,
                       router_materials)
