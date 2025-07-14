__all__ = ("router", )

from aiogram import Router

from .menu import router as router_menu
from .start import router as router_start

router = Router()
router.include_routers(router_start, router_menu)
