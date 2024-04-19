from django.urls import path
from .views import (LessonPage, LessonItemPage,
                    LessonListAPIView, LessonAddMaterials,
                    LessonReplaceTeacher)

urlpatterns = [
    path('', LessonPage.as_view(), name='lessons'),
    path('<int:pk>', LessonItemPage.as_view()),
]

apiv1patterns = [
    path('', LessonListAPIView.as_view()),
    path('<int:pk>/materials/', LessonAddMaterials.as_view()),
    path('<int:pk>/rt/', LessonReplaceTeacher.as_view()),
]
