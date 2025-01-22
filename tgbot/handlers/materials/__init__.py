__all__ = ("router", )

from aiogram import Router
from .search import router as router_search
from .add import router as router_add
from .send_tg import router as router_send_tg
from .navigation import router as router_navigation

router = Router()
router.include_routers(router_search,
                       router_add,
                       router_send_tg,
                       router_navigation)
