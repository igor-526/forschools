__all__ = ("router", )

from aiogram import Router
from .commands import router as router_commands
from .materials import router as router_materials
from .homeworks import router as router_homeworks
from .chats import router as router_chats


router = Router()
router.include_routers(router_commands,
                       router_materials,
                       router_homeworks,
                       router_chats)
