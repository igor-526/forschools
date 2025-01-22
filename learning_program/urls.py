from django.urls import path
from .views import LearningProgramsPageView
from .views_api import (LearningProgramHomeworkListAPIView,
                        LearningProgramLessonListAPIView,
                        LearningProgramPhaseListAPIView,
                        LearningProgramListAPIView,
                        LearningProgramHomeworkDetailAPIView,
                        LearningProgramLessonDetailAPIView,
                        LearningProgramPhaseDetailAPIView,
                        LearningProgramDetailAPIView)

urlpatterns = [
    path('', LearningProgramsPageView.as_view(), name='learning_programs'),
]

apiv1patterns = [
    path('hw/', LearningProgramHomeworkListAPIView.as_view()),
    path('hw/<int:pk>/', LearningProgramHomeworkDetailAPIView.as_view()),
    path('lesson/', LearningProgramLessonListAPIView.as_view()),
    path('lesson/<int:pk>/', LearningProgramLessonDetailAPIView.as_view()),
    path('phase/', LearningProgramPhaseListAPIView.as_view()),
    path('phase/<int:pk>/', LearningProgramPhaseDetailAPIView.as_view()),
    path('program/', LearningProgramListAPIView.as_view()),
    path('program/<int:pk>/', LearningProgramDetailAPIView.as_view()),
]
