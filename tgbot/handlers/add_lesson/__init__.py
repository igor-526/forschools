__all__ = ("router", )

from aiogram import Router
from .name import router as router_name
from .listener import router as router_listener

router = Router()
router.include_routers(router_name,
                       router_listener)
