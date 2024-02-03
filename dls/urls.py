from django.contrib import admin
from django.urls import path, include
from profile_management.urls import urlpatterns as profile_urlpatterns
from material.urls import urlpatterns as material_urlpatterns
from lesson.urls import urlpatterns as lesson_urlpatterns
from homework.urls import urlpatterns as homework_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),    # страницы администрирования
    path('', include(profile_urlpatterns)),     # страницы профиля
    path('materials/', include(material_urlpatterns)),  # страницы материалов
    path('lessons/', include(lesson_urlpatterns)),   # страницы уроков
    path('homeworks/', include(homework_urlpatterns)),   # страницы домашних заданий
]
