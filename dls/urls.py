from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from profile_management.urls import (urlpatterns as
                                     profile_urlpatterns,
                                     apiv1patterns as
                                     profile_apiv1patterns)
from material.urls import (urlpatterns as
                           material_urlpatterns,
                           apiv1patterns as
                           material_apiv1patterns)
from lesson.urls import (urlpatterns as
                         lesson_urlpatterns,
                         apiv1patterns as
                         lesson_apiv1patterns,
                         ma_patterns as lesson_ma_patterns)
from homework.urls import (urlpatterns as
                           homework_urlpatterns,
                           apiv1patterns as
                           homework_apiv1patterns)
from data_collections.urls import (urlpatterns as
                                   data_collections_urlpatterns,
                                   apiv1patterns as
                                   data_collections_apiv1patterns)
from learning_plan.urls import (urlpatterns as
                                learning_plan_urlpatterns,
                                apiv1patterns as
                                learning_plan_apiv1patterns)
from learning_program.urls import (urlpatterns as
                                   learning_program_urlpatterns,
                                   apiv1patterns as
                                   learning_program_apiv1patterns)
from chat.urls import (urlpatterns as
                       chat_urlpatterns,
                       apiv1patterns as
                       chat_apiv1patterns,
                       ma_patterns as
                       chat_ma_patterns)
from tgbot.urls import (apiv1patterns as
                        tgbot_apiv1patterns,
                        urlpatterns as
                        tgbot_urlpatterns,
                        apiv1journalpatterns as
                        tgbot_journal_apiv1patterns,
                        ma_patterns as tgbot_ma_patterns)
from automatic_fields.urls import (apiv1patterns as
                                   automatic_fields_apiv1patterns)
from support.urls import (urlpatterns as
                          support_urlpatterns,
                          apiv1patterns as
                          support_apiv1patterns)
from user_logs.urls import (urlpatterns as
                            user_logs_urlpatterns,
                            api_v1_patterns as
                            user_logs_api_v1_patterns)
from download_data.urls import (urlpatterns as
                                download_data_urlpatterns,
                                api_v1_patterns as
                                download_data_api_v1_patterns)
from mailing.urls import (urlpatterns as
                          mailing_urlpatterns,
                          api_v1_patterns as
                          mailing_api_v1_patterns)
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

    path('', include(data_collections_urlpatterns)),
    path('api/v1/', include(data_collections_apiv1patterns)),

    path('api/v1/automatic/', include(automatic_fields_apiv1patterns)),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
