from django.urls import path
from .views import LessonPage, LessonAddPage

urlpatterns = [
    path('', LessonPage.as_view(), name='lessons'),    # страница с материалами
    path('add', LessonAddPage.as_view(), name='lessons_add'),   # страница для добавления материала и категории
]
