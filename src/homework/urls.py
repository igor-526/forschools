from django.urls import path

from .views import HomeworkItemPage, HomeworksListPage
from .views_api import (HomeworkAdminCommentAPIView,
                        HomeworkItemAgreementAPIView,
                        HomeworkItemDeleteMaterialAPIView,
                        HomeworkItemPageInfoAPIView,
                        HomeworkItemPageSendTGAPIView,
                        HomeworkItemPageSendTelegramAPIView,
                        HomeworkListCreateAPIView,
                        HomeworkLogAPIView,
                        HomeworkLogListCreateAPIView,
                        HomeworkReplaceTeacherAPIView,
                        HomeworkRetrieveUpdateDestroyAPIView,
                        HomeworkSetCancelledAPIView
                        )

urlpatterns = [
    path('', HomeworksListPage.as_view(), name='homeworks'),
    path('<int:pk>/', HomeworkItemPage.as_view()),
]

apiv1patterns = [
    path('', HomeworkListCreateAPIView.as_view()),
    path('<int:pk>/', HomeworkRetrieveUpdateDestroyAPIView.as_view()),
    path('<int:pk>/info/', HomeworkItemPageInfoAPIView.as_view()),
    path('<int:pk>/edit/', HomeworkItemPageSendTGAPIView.as_view()),
    path('<int:pk>/send_tg/', HomeworkItemPageSendTelegramAPIView.as_view()),
    path('<int:pk>/logs/', HomeworkLogListCreateAPIView.as_view()),
    path('<int:pk>/rt/', HomeworkReplaceTeacherAPIView.as_view()),
    path('<int:pk>/set_cancelled/', HomeworkSetCancelledAPIView.as_view()),
    path('<int:pk>/agreement/<str:action>/',
         HomeworkItemAgreementAPIView.as_view()),
    path('logs/<int:pk>/', HomeworkLogAPIView.as_view()),
    path('<int:pk>/set_admin_comment/', HomeworkAdminCommentAPIView.as_view()),
    path('<int:hw_id>/mat/<int:mat_id>/',
         HomeworkItemDeleteMaterialAPIView.as_view()),
]
