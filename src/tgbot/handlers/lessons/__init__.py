from aiogram import Router

from .lessons import router as router_lessons
from .review import router as router_review

router = Router()
router.include_routers(router_lessons)
router.include_routers(router_review)
