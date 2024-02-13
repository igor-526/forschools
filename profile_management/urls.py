from django.urls import path
from django.views.generic.base import RedirectView
from .views import DashboardPage, user_login, user_logout, register_view, TelegramPage

urlpatterns = [
    path('', RedirectView.as_view(url='dashboard')),  # редирект на профиль
    path('login', user_login, name='login'),    # страница авторизации
    path('logout', user_logout, name='logout'),  # логаут
    path('dashboard', DashboardPage.as_view(), name='dashboard'),  # страница профиля
    path('register', register_view, name='register'),  # страница регистрации профиля
    path('profile/telegram', TelegramPage.as_view(), name='telegram'),  # страница привязки профиля к Telegram
]
