from django.urls import path

from .views import MailingNewPage, MailingPage
from .views_api import (GroupMailingTasksListAPIView,
                        GroupMailingTasksRetrieveAPIView,
                        MailingInitiatorsListAPIView,
                        MailingStartAPIView,
                        MailingUserListAPIView)

urlpatterns = [
    path('', MailingPage.as_view(), name='mailing'),
    path('new/', MailingNewPage.as_view(), name='mailing_new'),
]

api_v1_patterns = [
    path('', GroupMailingTasksListAPIView.as_view()),
    path('<int:pk>/', GroupMailingTasksRetrieveAPIView.as_view()),
    path('initiators/', MailingInitiatorsListAPIView.as_view()),
    path('users/', MailingUserListAPIView.as_view()),
    path('start/', MailingStartAPIView.as_view()),
]
