from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView
from profile_management.views_v2_auth import CustomTokenObtainPairView, CustomTokenRefreshView, LogoutView

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view()),
    path('token/refresh/', CustomTokenRefreshView.as_view()),
    path('token/verify/', TokenVerifyView.as_view()),
    path('logout/', LogoutView.as_view()),
]