from django.urls import path

from lesson.api_v2.views import LessonListAPIView, LessonPlacesListAPIView, LessonDetailRetrieveUpdateAPIView

urlpatterns = [
    path('', LessonListAPIView.as_view()),
    path('places/', LessonPlacesListAPIView.as_view()),
    path('<int:pk>/', LessonDetailRetrieveUpdateAPIView.as_view()),
]
