from django.urls import path
from .views import (LessonPage, LessonItemPage,
                    LessonListAPIView, LessonAddMaterialsAPIView,
                    LessonReplaceTeacherAPIView, LessonAPIView,
                    LessonSetPassedAPIView, PlansItemRescheduling,
                    LessonSetNotHeldAPIView)

urlpatterns = [
    path('', LessonPage.as_view(), name='lessons'),
    path('<int:pk>', LessonItemPage.as_view()),
]

apiv1patterns = [
    path('', LessonListAPIView.as_view()),
    path('<int:pk>/', LessonAPIView.as_view()),
    path('<int:pk>/rescheduling/', PlansItemRescheduling.as_view()),
    path('<int:pk>/materials/', LessonAddMaterialsAPIView.as_view()),
    path('<int:pk>/rt/', LessonReplaceTeacherAPIView.as_view()),
    path('<int:pk>/set_passed/', LessonSetPassedAPIView.as_view()),
    path('<int:pk>/set_not_held/', LessonSetNotHeldAPIView.as_view()),
]