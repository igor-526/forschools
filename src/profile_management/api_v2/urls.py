from django.urls import path

from profile_management.api_v2.views import UsersNameOnlyListAPIView, UsersListCreateAPIView

urlpatterns = [
    path('', UsersListCreateAPIView.as_view()),
    path('nameonly/', UsersNameOnlyListAPIView.as_view()),
]