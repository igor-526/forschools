from django.urls import path

from lesson.views_api import LessonListCreateAPIView

from .views import PlansItemPageView, PlansPageView
from .views_api import (PlanItemAddLessonsAPIView,
                        PlanItemAdminCommentAPIView,
                        PlanPhaseItemAPIView,
                        PlanPhasesListCreateAPIView,
                        PlansDownloadAPIView,
                        PlansItemAPIView,
                        PlansItemPreHWCommentAPIView,
                        PlansItemSetProgramAPIView,
                        PlansItemStatusAPIView,
                        PlansListCreateAPIView, PlanItemScheduleAPIView)

urlpatterns = [
    path('', PlansPageView.as_view(), name='learning_plans'),
    path('<int:pk>/', PlansItemPageView.as_view(), name='learning_plans_add'),
]

apiv1patterns = [
    path('', PlansListCreateAPIView.as_view()),
    path('download/', PlansDownloadAPIView.as_view()),
    path('<int:pk>/', PlansItemAPIView.as_view()),
    path('<int:pk>/pre_hw_comment/', PlansItemPreHWCommentAPIView.as_view()),
    path('<int:pk>/status/', PlansItemStatusAPIView.as_view()),
    path('<int:plan_pk>/phases/', PlanPhasesListCreateAPIView.as_view()),
    path('<int:plan_pk>/phases/<int:pk>/', PlanPhaseItemAPIView.as_view()),
    path('phases/<int:phase_pk>/add/', LessonListCreateAPIView.as_view()),
    path('<int:plan_pk>/setprogram/', PlansItemSetProgramAPIView.as_view()),
    path('<int:plan_pk>/add_lessons/', PlanItemAddLessonsAPIView.as_view()),
    path('<int:pk>/set_admin_comment/', PlanItemAdminCommentAPIView.as_view()),
    path('<int:pk>/schedule/', PlanItemScheduleAPIView.as_view())
]
