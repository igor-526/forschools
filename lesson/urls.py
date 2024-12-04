from django.urls import path
from .views import (LessonPage, LessonItemPage,
                    LessonListAPIView, LessonSetMaterialsAPIView,
                    LessonReplaceTeacherAPIView, LessonAPIView,
                    LessonSetPassedAPIView, PlansItemRescheduling,
                    LessonSetNotHeldAPIView, LessonRestoreAPIView)
from .views_ma import LessonMAReviewFormPage

urlpatterns = [
    path('', LessonPage.as_view(), name='lessons'),
    path('<int:pk>', LessonItemPage.as_view()),
]

apiv1patterns = [
    path('', LessonListAPIView.as_view()),
    path('<int:pk>/', LessonAPIView.as_view()),
    path('<int:pk>/rescheduling/', PlansItemRescheduling.as_view()),
    path('<int:pk>/materials/', LessonSetMaterialsAPIView.as_view()),
    path('<int:pk>/rt/', LessonReplaceTeacherAPIView.as_view()),
    path('<int:pk>/set_passed/', LessonSetPassedAPIView.as_view()),
    path('<int:pk>/set_not_held/', LessonSetNotHeldAPIView.as_view()),
    path('<int:pk>/restore/', LessonRestoreAPIView.as_view()),
]

ma_patterns = [
    path('<int:pk>/', LessonMAReviewFormPage.as_view()),
]
