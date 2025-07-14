__all__ = ("router", )

from aiogram import Router

from .chats import router as router_chats
from .commands import router as router_commands
from .homeworks import router as router_homeworks
from .lessons import router as router_lessons
from .materials import router as router_materials
from .multiuser import router as router_multiuser
from .settings import router as router_settings


router = Router()
router.include_routers(router_commands,
                       router_homeworks,
                       router_chats,
                       router_lessons,
                       router_materials,
                       router_settings,
                       router_multiuser)
