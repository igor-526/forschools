from django.urls import path
from .views import LessonPage, LessonListView, LessonPlaceView

urlpatterns = [
    path('', LessonPage.as_view(), name='lessons'),    # страница с материалами
]

apiv1patterns = [
    path('', LessonListView.as_view()),
    path('places', LessonPlaceView.as_view())
]
