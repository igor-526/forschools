from chat.urls import (apiv1patterns as chat_apiv1patterns,
                       ma_patterns as chat_ma_patterns,
                       urlpatterns as chat_urlpatterns)

from data_collections.urls import (apiv1patterns as
                                   data_collections_apiv1patterns,
                                   urlpatterns as data_collections_urlpatterns)

from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from download_data.urls import (api_v1_patterns as
                                download_data_api_v1_patterns,
                                urlpatterns as download_data_urlpatterns)

from homework.urls import (apiv1patterns as homework_apiv1patterns,
                           urlpatterns as homework_urlpatterns)

from learning_plan.urls import (apiv1patterns as learning_plan_apiv1patterns,
                                urlpatterns as learning_plan_urlpatterns)

from learning_program.urls import (apiv1patterns as
                                   learning_program_apiv1patterns,
                                   urlpatterns as learning_program_urlpatterns)

from lesson.urls import (apiv1patterns as lesson_apiv1patterns,
                         ma_patterns as lesson_ma_patterns,
                         urlpatterns as lesson_urlpatterns)

from mailing.urls import (api_v1_patterns as mailing_api_v1_patterns,
                          urlpatterns as mailing_urlpatterns)

from material.urls import (apiv1patterns as material_apiv1patterns,
                           urlpatterns as material_urlpatterns)

from profile_management.urls import (apiv1patterns as profile_apiv1patterns,
                                     urlpatterns as profile_urlpatterns,
                                     welcome_api_v1_patterns as welcome_api_v1_patterns)

from support.urls import (apiv1patterns as support_apiv1patterns,
                          urlpatterns as support_urlpatterns)

from tgbot.urls import (apiv1journalpatterns as tgbot_journal_apiv1patterns,
                        apiv1patterns as tgbot_apiv1patterns,
                        ma_patterns as tgbot_ma_patterns,
                        urlpatterns as tgbot_urlpatterns)

from user_logs.urls import (api_v1_patterns as user_logs_api_v1_patterns,
                            urlpatterns as user_logs_urlpatterns)

from . import settings


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(profile_urlpatterns)),
    path('api/v1/users/', include(profile_apiv1patterns)),

    path('materials/', include(material_urlpatterns)),
    path('api/v1/materials/', include(material_apiv1patterns)),

    path('lessons/', include(lesson_urlpatterns)),
    path('api/v1/lessons/', include(lesson_apiv1patterns)),
    path('ma/lessons/', include(lesson_ma_patterns)),

    path('homeworks/', include(homework_urlpatterns)),
    path('api/v1/homeworks/', include(homework_apiv1patterns)),

    path('learning_plans/', include(learning_plan_urlpatterns)),
    path('api/v1/learning_plans/', include(learning_plan_apiv1patterns)),

    path('learning_programs/', include(learning_program_urlpatterns)),
    path('api/v1/learning_programs/',
         include(learning_program_apiv1patterns)),

    path('messages/', include(chat_urlpatterns)),
    path('api/v1/messages/', include(chat_apiv1patterns)),
    path('ma/messages/', include(chat_ma_patterns)),

    path('user_logs/', include(user_logs_urlpatterns)),
    path('api/v1/user_logs/', include(user_logs_api_v1_patterns)),

    path('generated/', include(download_data_urlpatterns)),
    path('api/v1/generated/', include(download_data_api_v1_patterns)),

    path('mailing/', include(mailing_urlpatterns)),
    path('api/v1/mailing/', include(mailing_api_v1_patterns)),

    path('api/v1/telegram/', include(tgbot_apiv1patterns)),
    path('tgjournal/', include(tgbot_urlpatterns)),
    path('api/v1/tgjournal/', include(tgbot_journal_apiv1patterns)),
    path('ma/', include(tgbot_ma_patterns)),

    path('support/', include(support_urlpatterns)),
    path('api/v1/support/', include(support_apiv1patterns)),

    path('api/v1/welcome/', include(welcome_api_v1_patterns)),

    path('', include(data_collections_urlpatterns)),
    path('api/v1/', include(data_collections_apiv1patterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
