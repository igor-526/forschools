from aiogram import Router

from .homework import router as router_homework

router = Router()
router.include_routers(router_homework)
