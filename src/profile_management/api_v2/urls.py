from django.urls import path

from profile_management.api_v2.views import UsersNameOnlyListAPIView

urlpatterns = [
    path('nameonly/', UsersNameOnlyListAPIView.as_view()),
]