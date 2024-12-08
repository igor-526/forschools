from django.urls import path
from django.views.generic.base import RedirectView
from .views import (DashboardPage, user_login,
                    user_logout, register_view,
                    UsersPage, UserListAPIView,
                    UserDetailAPIView,
                    UserPhotoApiView, ProfilePage,
                    TelegramAPIView, DeactivateUserView,
                    ActivateUserView, ChangePasswordView,
                    TeacherListenersListAPIView, UsersForJournalListAPIView,
                    AdminLoginAPIView)
from homework.views_api import UserHWListAPIView
from lesson.views import UserLessonListAPIView

urlpatterns = [
    path('', RedirectView.as_view(url='dashboard')),
    path('login', user_login, name='login'),
    path('logout', user_logout, name='logout'),
    path('register/', register_view, name='register'),
    path('dashboard', DashboardPage.as_view(), name='dashboard'),
    path('profile/<int:pk>', ProfilePage.as_view()),
    path('profile', ProfilePage.as_view(), name='profile'),
    path('administration/users', UsersPage.as_view(),
         name='admin_users'),
]

apiv1patterns = [
    path('', UserListAPIView.as_view()),
    path('forjournals/', UsersForJournalListAPIView.as_view()),
    path('teacherslisteners/', TeacherListenersListAPIView.as_view()),
    path('<int:pk>/', UserDetailAPIView.as_view()),
    path('<int:pk>/photo/', UserPhotoApiView.as_view()),
    path('<int:pk>/telegram/', TelegramAPIView.as_view()),
    path('<int:pk>/deactivate/', DeactivateUserView.as_view()),
    path('<int:pk>/activate/', ActivateUserView.as_view()),
    path('<int:pk>/login/', AdminLoginAPIView.as_view()),
    path('<int:pk>/reset_password/', ChangePasswordView.as_view()),
    path('<int:pk>/hw/', UserHWListAPIView.as_view()),
    path('<int:pk>/lessons/', UserLessonListAPIView.as_view()),
]

