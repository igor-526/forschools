__all__ = ("router", )

from aiogram import Router
from .settings import router as router_settings

router = Router()
router.include_routers(router_settings)
