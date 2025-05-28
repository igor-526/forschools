from django.urls import path
from .views import HomeworksListPage, HomeworkItemPage
from .views_api import (HomeworkListCreateAPIView,
                        HomeworkLogListCreateAPIView,
                        HomeworkReplaceTeacherAPIView,
                        HomeworkSetCancelledAPIView,
                        HomeworkItemPageInfoAPIView,
                        HomeworkItemPageSendTGAPIView,
                        HomeworkLogAPIView,
                        HomeworkRetrieveUpdateDestroyAPIView,
                        HomeworkItemDeleteMaterialAPIView,
                        HomeworkItemAgreementAPIView,
                        HomeworkItemPageSendTelegramAPIView)

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
    path('<int:hw_id>/mat/<int:mat_id>/',
         HomeworkItemDeleteMaterialAPIView.as_view()),
]
