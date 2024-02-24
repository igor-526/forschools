from django.contrib import admin
from django.urls import path, include
from profile_management.urls import (urlpatterns as profile_urlpatterns,
                                     apiv1patterns as profile_apiv1patterns)
from material.urls import (urlpatterns as material_urlpatterns,
                           apiv1patterns as material_apiv1patterns)
from lesson.urls import (urlpatterns as lesson_urlpatterns,
                         apiv1patterns as lesson_apiv1patterns)
from homework.urls import urlpatterns as homework_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),    # страницы администрирования
    path('', include(profile_urlpatterns)),     # страницы профиля
    path('materials/', include(material_urlpatterns)),  # страницы материалов
    path('lessons/', include(lesson_urlpatterns)),   # страницы уроков
    path('homeworks/', include(homework_urlpatterns)),   # страницы домашних заданий
    path('api/v1/users/', include(profile_apiv1patterns)),
    path('api/v1/materials/', include(material_apiv1patterns)),
    path('api/v1/lessons/', include(lesson_apiv1patterns))
]
