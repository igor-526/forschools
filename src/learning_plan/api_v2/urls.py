from django.urls import path

from learning_plan.api_v2.views import PlansListCreateAPIView

urlpatterns = [
    path('', PlansListCreateAPIView.as_view()),
]
