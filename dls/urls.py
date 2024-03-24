from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from . import settings

from profile_management.urls import (urlpatterns as profile_urlpatterns,
                                     apiv1patterns as profile_apiv1patterns)
from material.urls import (urlpatterns as material_urlpatterns,
                           apiv1patterns as material_apiv1patterns)
from lesson.urls import (urlpatterns as lesson_urlpatterns,
                         apiv1patterns as lesson_apiv1patterns)
from homework.urls import urlpatterns as homework_urlpatterns
from data_collections.urls import (urlpatterns as data_collections_urlpatterns,
                                   apiv1patterns as data_collections_apiv1patterns)
from tgbot.urls import apiv1patterns as tgbot_apiv1patterns
from pdfviewer.urls import urlpatterns as pdfviewer_urlpatterns


urlpatterns = [
    path('admin/', admin.site.urls),    # страницы администрирования
    path('', include(profile_urlpatterns)),     # страницы профиля
    path('materials/', include(material_urlpatterns)),  # страницы материалов
    path('lessons/', include(lesson_urlpatterns)),   # страницы уроков
    path('homeworks/', include(homework_urlpatterns)),   # страницы домашних заданий
    path('pdfviewer/', include(pdfviewer_urlpatterns)),  # просмотрщик PDF
    path('', include(data_collections_urlpatterns)),  # страницы коллекций данных
    path('api/v1/users/', include(profile_apiv1patterns)),
    path('api/v1/materials/', include(material_apiv1patterns)),
    path('api/v1/lessons/', include(lesson_apiv1patterns)),
    path('api/v1/telegram/', include(tgbot_apiv1patterns)),
    path('api/v1/', include(data_collections_apiv1patterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
