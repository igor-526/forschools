from django.urls import path
from .views import ChatPageTemplateView
from .views_api import (ChatUsersListAPIView, ChatMessagesListCreateAPIView,
                        ChatGroupsCreateAPIView)

urlpatterns = [
    path('', ChatPageTemplateView.as_view(), name='chats'),
]

apiv1patterns = [
    path('', ChatUsersListAPIView.as_view()),
    path('groupchats/', ChatGroupsCreateAPIView.as_view()),
    path('<int:user>/', ChatMessagesListCreateAPIView.as_view()),
]
