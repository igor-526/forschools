from django.urls import path
from django.views.generic.base import RedirectView

from homework.views_api import UserHWListAPIView

from lesson.views_api import UserLessonListAPIView

from .views import (DashboardPageTemplateView,
                    EventJournalTemplateView,
                    ProfilePageTemplateView,
                    UsersPageTemplateView)
from .views_api import (ActivateUserAPIView,
                        ChangePasswordAPIView,
                        DeactivateUserAPIView,
                        ProfileEventsJournalListAPIView,
                        UserDetailAPIView,
                        UserListAPIView,
                        UserPhotoAPIView,
                        UsersForJournalListAPIView,
                        UsersForScheduleListAPIView)
from .views_login import (AdminLoginAPIView,
                          LoginPageTemplateView,
                          TelegramLoginPageView,
                          UserLoginAPIView,
                          UserTelegramLoginAPIView,
                          WelcomePageTemplateView,
                          WelcomeURLAPIView,
                          WelcomeURLPatchAPIView,
                          register_view,
                          user_logout)

urlpatterns = [
    path('', RedirectView.as_view(url='dashboard')),
    path('welcome/<str:welcome_url>/', WelcomePageTemplateView.as_view()),
    path('login/', LoginPageTemplateView.as_view(), name='login'),
    path('login_tg/', TelegramLoginPageView.as_view(), name='login_tg'),
    path('auth/', UserLoginAPIView.as_view()),
    path('auth_tg/', UserTelegramLoginAPIView.as_view()),
    path('logout', user_logout, name='logout'),
    path('register/', register_view, name='register'),
    path('dashboard', DashboardPageTemplateView.as_view(),
         name='dashboard'),
    path('profile/<int:pk>', ProfilePageTemplateView.as_view()),
    path('profile', ProfilePageTemplateView.as_view(),
         name='profile'),
    path('events_journal', EventJournalTemplateView.as_view(),
         name='events_journal'),
    path('administration/users', UsersPageTemplateView.as_view(),
         name='admin_users'),
]

apiv1patterns = [
    path('', UserListAPIView.as_view()),
    path('events_journal/', ProfileEventsJournalListAPIView.as_view()),
    path('forjournals/', UsersForJournalListAPIView.as_view()),
    path('schedule/', UsersForScheduleListAPIView.as_view()),
    path('welcome/<str:welcome_url>/set/', WelcomeURLPatchAPIView.as_view()),
    path('<int:pk>/', UserDetailAPIView.as_view()),
    path('<int:pk>/photo/', UserPhotoAPIView.as_view()),
    path('<int:pk>/deactivate/', DeactivateUserAPIView.as_view()),
    path('<int:pk>/activate/', ActivateUserAPIView.as_view()),
    path('<int:pk>/login/', AdminLoginAPIView.as_view()),
    path('<int:pk>/reset_password/', ChangePasswordAPIView.as_view()),
    path('<int:pk>/hw/', UserHWListAPIView.as_view()),
    path('<int:pk>/lessons/', UserLessonListAPIView.as_view()),
    path('<int:pk>/welcome/', WelcomeURLAPIView.as_view()),
]

welcome_api_v1_patterns = [
    path('<str:welcome_url>/set/', WelcomeURLPatchAPIView.as_view()),
]
