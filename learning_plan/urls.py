from django.urls import path
from .views import (PlansPageView, PlansItemPageView,
                    PlansListView, PlanPhasesAPIView,
                    PlanPhaseItemAPIView)
from lesson.views import LessonListCreateAPIView

urlpatterns = [
    path('', PlansPageView.as_view(), name='learning_plans'),    # страница с планами
    path('<int:pk>', PlansItemPageView.as_view(), name='learning_plans_add'),  # страница добавления плана
]

apiv1patterns = [
    path('', PlansListView.as_view()),
    path('<int:plan_pk>/phases/', PlanPhasesAPIView.as_view()),
    path('<int:plan_pk>/phases/<int:pk>', PlanPhaseItemAPIView.as_view()),
    path('phases/<int:phase_pk>/add/', LessonListCreateAPIView.as_view()),
]
