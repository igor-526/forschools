from django.urls import path
from django.views.generic.base import RedirectView
from .views import (DashboardPageTemplateView,
                    UsersPageTemplateView,
                    ProfilePageTemplateView,
                    EventJournalTemplateView)
from .views_api import (UserListAPIView,
                        UserDetailAPIView,
                        UserPhotoAPIView,
                        DeactivateUserAPIView,
                        ActivateUserAPIView,
                        ChangePasswordAPIView,
                        UsersForJournalListAPIView,
                        UsersForScheduleListAPIView,
                        ProfileEventsJournalListAPIView)
from .views_login import (user_logout,
                          LoginPageTemplateView,
                          register_view,
                          AdminLoginAPIView,
                          UserLoginAPIView)
from lesson.views_api import UserLessonListAPIView
from homework.views_api import UserHWListAPIView

urlpatterns = [
    path('', RedirectView.as_view(url='dashboard')),
    path('login/', LoginPageTemplateView.as_view(), name='login'),
    path('auth/', UserLoginAPIView.as_view()),
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
    path('<int:pk>/', UserDetailAPIView.as_view()),
    path('<int:pk>/photo/', UserPhotoAPIView.as_view()),
    path('<int:pk>/deactivate/', DeactivateUserAPIView.as_view()),
    path('<int:pk>/activate/', ActivateUserAPIView.as_view()),
    path('<int:pk>/login/', AdminLoginAPIView.as_view()),
    path('<int:pk>/reset_password/', ChangePasswordAPIView.as_view()),
    path('<int:pk>/hw/', UserHWListAPIView.as_view()),
    path('<int:pk>/lessons/', UserLessonListAPIView.as_view()),
]
