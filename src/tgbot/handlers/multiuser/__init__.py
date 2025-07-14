__all__ = ("router", )

from aiogram import Router

from .multiuser import router as router_multiuser

router = Router()
router.include_routers(router_multiuser)
