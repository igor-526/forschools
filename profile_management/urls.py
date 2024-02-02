from django.urls import path
from django.views.generic.base import RedirectView
from .views import ProfilePage, user_login, user_logout, RegisterPage, register_view

urlpatterns = [
    path('', RedirectView.as_view(url='profile')),  # редирект на профиль
    path('login', user_login, name='login'),    # страница авторизации
    path('logout', user_logout, name='logout'),  # логаут
    path('profile', ProfilePage.as_view(), name='profile'),  # страница профиля
    path('register', register_view, name='register'),  # страница регистрации профиля
]
