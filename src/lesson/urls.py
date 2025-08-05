from django.urls import path

from .views import LessonItemPage, LessonsListPage, LessonScheduleTemplateView
from .views_api import (LessonAPIView,
                        LessonAdminCommentAPIView,
                        LessonListAPIView,
                        LessonReplaceTeacherAPIView,
                        LessonRestoreAPIView,
                        LessonSendPlaceTGAPIVIew,
                        LessonSetAdditionalListeners,
                        LessonSetMaterialsAPIView,
                        LessonSetNotHeldAPIView,
                        LessonSetPassedAPIView,
                        PlansItemRescheduling,
                        ScheduleAPIView)

urlpatterns = [
    path('', LessonsListPage.as_view(), name='lessons'),
    path('<int:pk>/', LessonItemPage.as_view()),
    path('schedule/<int:pk>/', LessonScheduleTemplateView.as_view()),
    path('schedule/', LessonScheduleTemplateView.as_view(), name='schedule'),
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
    path('<int:pk>/send_tg_place/', LessonSendPlaceTGAPIVIew.as_view()),
]
