from django.urls import path
from .views import ChatPageTemplateView
from .views_api import (ChatUsersListAPIView, ChatMessagesListCreateAPIView,
                        ChatGroupsCreateAPIView)
from .views_ma import ChatPageSelectUserMATemplateView, ChatPageChatMATemplateView

urlpatterns = [
    path('', ChatPageTemplateView.as_view(), name='chats'),
]

apiv1patterns = [
    path('', ChatUsersListAPIView.as_view()),
    path('groupchats/', ChatGroupsCreateAPIView.as_view()),
    path('<int:user>/', ChatMessagesListCreateAPIView.as_view()),
]

ma_patterns = [
    path('', ChatPageSelectUserMATemplateView.as_view()),
    path('<int:chat_id>/', ChatPageChatMATemplateView.as_view()),
]
