from django.urls import path
from .views import LessonsListPage, LessonItemPage
from .views_api import (LessonListAPIView, LessonSetMaterialsAPIView,
                        LessonReplaceTeacherAPIView, LessonAPIView,
                        LessonSetPassedAPIView, PlansItemRescheduling,
                        LessonSetNotHeldAPIView, LessonRestoreAPIView,
                        ScheduleAPIView, LessonAdminCommentAPIView,
                        LessonSetAdditionalListeners)
from .views_ma import LessonMAReviewFormPage, LessonItemMAPage, ScheduleSelectMAPage, ScheduleMAPage

urlpatterns = [
    path('', LessonsListPage.as_view(), name='lessons'),
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
    path('<int:pk>/set_additional/', LessonSetAdditionalListeners.as_view()),
    path('<int:pk>/restore/', LessonRestoreAPIView.as_view()),
    path('schedule/<int:pk>/', ScheduleAPIView.as_view()),
    path('<int:pk>/set_admin_comment/', LessonAdminCommentAPIView.as_view()),

]

ma_patterns = [
    path('<int:pk>/form/', LessonMAReviewFormPage.as_view()),
    path('<int:pk>/', LessonItemMAPage.as_view()),
    path('schedule/', ScheduleSelectMAPage.as_view()),
    path('schedule/<int:pk>/', ScheduleMAPage.as_view()),
]
