from aiogram import Router
from .lessons import router as router_lessons

router = Router()
router.include_routers(router_lessons)