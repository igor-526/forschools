__all__ = ("router", )

from aiogram import Router
from .start import router as router_start
from .menu import router as router_menu
from .show_hw import router as hw_router

router = Router()
router.include_routers(router_start,
                       router_menu,
                       hw_router)
