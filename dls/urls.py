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
from homework.urls import (urlpatterns as homework_urlpatterns,
                           apiv1patterns as homework_apiv1patterns)
from data_collections.urls import (urlpatterns as data_collections_urlpatterns,
                                   apiv1patterns as data_collections_apiv1patterns)
from learning_plan.urls import (urlpatterns as learning_plan_urlpatterns,
                                apiv1patterns as learning_plan_apiv1patterns)
from learning_program.urls import (urlpatterns as learning_program_urlpatterns,
                                   apiv1patterns as learning_program_apiv1patterns)
from tgbot.urls import apiv1patterns as tgbot_apiv1patterns
from automatic_fields.urls import apiv1patterns as automatic_fields_apiv1patterns


urlpatterns = [
    path('admin/', admin.site.urls),    # страницы администрирования
    path('', include(profile_urlpatterns)),     # страницы профиля
    path('materials/', include(material_urlpatterns)),  # страницы материалов
    path('lessons/', include(lesson_urlpatterns)),   # страницы занятий
    path('homeworks/', include(homework_urlpatterns)),   # страницы домашних заданий
    path('', include(data_collections_urlpatterns)),  # страницы коллекций данных
    path('learning_plans/', include(learning_plan_urlpatterns)),

    path('learning_programs/', include(learning_program_urlpatterns)),
    path('api/v1/learning_programs/', include(learning_program_apiv1patterns)),

    path('api/v1/learning_plans/', include(learning_plan_apiv1patterns)),
    path('api/v1/users/', include(profile_apiv1patterns)),
    path('api/v1/materials/', include(material_apiv1patterns)),
    path('api/v1/lessons/', include(lesson_apiv1patterns)),
    path('api/v1/telegram/', include(tgbot_apiv1patterns)),
    path('api/v1/homeworks/', include(homework_apiv1patterns)),
    path('api/v1/automatic/', include(automatic_fields_apiv1patterns)),
    path('api/v1/', include(data_collections_apiv1patterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
