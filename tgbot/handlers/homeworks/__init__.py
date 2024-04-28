__all__ = ("router", )

from aiogram import Router
from .show import router as router_show
from .checksend import router as router_checksend
from .search import router as router_search

router = Router()
router.include_routers(router_show, router_checksend, router_search)
