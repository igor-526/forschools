from django.urls import path
from django.views.generic.base import RedirectView
from .views import (DashboardPage, user_login,
                    user_logout, register_view,
                    UsersPage, UserListAPIView,
                    UserDetailAPIView,
                    UserPhotoApiView, ProfilePage,
                    TelegramAPIView, DeactivateUserView,
                    ActivateUserView, ChangePasswordView)
from homework.views import UserHWListApiView
from lesson.views import UserLessonListAPIView

urlpatterns = [
    path('', RedirectView.as_view(url='dashboard')),  # редирект на дэшборд
    path('login', user_login, name='login'),    # страница авторизации
    path('logout', user_logout, name='logout'),  # логаут
    path('register', register_view, name='register', ),  # API для регистрации пользователя
    path('dashboard', DashboardPage.as_view(), name='dashboard'),  # страница Dashboard
    path('profile/<int:pk>', ProfilePage.as_view()),     # страница профиля пользователя
    path('profile', ProfilePage.as_view(), name='profile'),  # страница профиля пользователя
    path('administration/users', UsersPage.as_view(),
         name='admin_users'),   # страница пользователей (администрирование)
]

apiv1patterns = [
    path('', UserListAPIView.as_view()),  # API для вывода списка пользователей
    path('<int:pk>/', UserDetailAPIView.as_view()),     # API для вывода, изменения и удаления пользователя
    path('<int:pk>/photo/', UserPhotoApiView.as_view()),  # API для изменения фото профиля
    path('<int:pk>/telegram/', TelegramAPIView.as_view()),     # API для удаления привязки Telegram
    path('<int:pk>/deactivate/', DeactivateUserView.as_view()),     # API для деактивации пользователя
    path('<int:pk>/activate/', ActivateUserView.as_view()),  # API для активации пользователя
    path('<int:pk>/reset_password/', ChangePasswordView.as_view()),  # API для смены пароля пользователя
    path('<int:pk>/hw/', UserHWListApiView.as_view()),
    path('<int:pk>/lessons/', UserLessonListAPIView.as_view()),
]
