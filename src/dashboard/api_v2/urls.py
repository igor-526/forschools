from django.urls import path

from dashboard.api_v2.views import DashboardAPIView

urlpatterns = [
    path('<str:mode>/', DashboardAPIView.as_view()),
]