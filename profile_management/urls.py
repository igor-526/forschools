from django.urls import path
from django.views.generic.base import RedirectView
from .views import DashboardPageTemplateView, UsersPageTemplateView, ProfilePageTemplateView
from .views_api import (UserListAPIView, UserDetailAPIView,
                        UserPhotoAPIView, TelegramAPIView,
                        DeactivateUserAPIView, ActivateUserAPIView,
                        ChangePasswordAPIView, TeacherListenersListAPIView,
                        UsersForJournalListAPIView)
from .views_login import (user_login, user_logout,
                          register_view, AdminLoginAPIView)
from homework.views_api import UserHWListAPIView
from lesson.views import UserLessonListAPIView

urlpatterns = [
    path('', RedirectView.as_view(url='dashboard')),
    path('login', user_login, name='login'),
    path('logout', user_logout, name='logout'),
    path('register/', register_view, name='register'),
    path('dashboard', DashboardPageTemplateView.as_view(), name='dashboard'),
    path('profile/<int:pk>', ProfilePageTemplateView.as_view()),
    path('profile', ProfilePageTemplateView.as_view(), name='profile'),
    path('administration/users', UsersPageTemplateView.as_view(),
         name='admin_users'),
]

apiv1patterns = [
    path('', UserListAPIView.as_view()),
    path('forjournals/', UsersForJournalListAPIView.as_view()),
    path('teacherslisteners/', TeacherListenersListAPIView.as_view()),
    path('<int:pk>/', UserDetailAPIView.as_view()),
    path('<int:pk>/photo/', UserPhotoAPIView.as_view()),
    path('<int:pk>/telegram/', TelegramAPIView.as_view()),
    path('<int:pk>/deactivate/', DeactivateUserAPIView.as_view()),
    path('<int:pk>/activate/', ActivateUserAPIView.as_view()),
    path('<int:pk>/login/', AdminLoginAPIView.as_view()),
    path('<int:pk>/reset_password/', ChangePasswordAPIView.as_view()),
    path('<int:pk>/hw/', UserHWListAPIView.as_view()),
    path('<int:pk>/lessons/', UserLessonListAPIView.as_view()),
]

