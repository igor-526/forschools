from django.urls import path
from .views import ChatPageTemplateView, ChatAdminPageTemplateView, ChatUnsentPageTemplateView
from .views_api import (ChatUsersListAPIView, ChatMessagesListCreateAPIView,
                        ChatGroupsCreateAPIView, ChatAdminUsersListAPIView,
                        ChatUnsentAPIView)
from .views_ma import (ChatPageSelectUserMATemplateView, ChatPageChatMATemplateView,
                       ChatAdminPageSelectUserMATemplateView, ChatAdminPageChatMATemplateView)

urlpatterns = [
    path('', ChatPageTemplateView.as_view(), name='chats'),
    path('admin_messages', ChatAdminPageTemplateView.as_view(), name='admin_chats'),
    path('unsent/', ChatUnsentPageTemplateView.as_view(), name='unsent_chats'),
]

apiv1patterns = [
    path('', ChatUsersListAPIView.as_view()),
    path('admin_messages/', ChatAdminUsersListAPIView.as_view()),
    path('groupchats/', ChatGroupsCreateAPIView.as_view()),
    path('unsent/', ChatUnsentAPIView.as_view()),
    path('<int:user>/', ChatMessagesListCreateAPIView.as_view()),
]

ma_patterns = [
    path('', ChatPageSelectUserMATemplateView.as_view()),
    path('<int:chat_id>/', ChatPageChatMATemplateView.as_view()),
    path('admin_messages/', ChatAdminPageSelectUserMATemplateView.as_view()),
    path('admin_messages/<int:chat_id>/', ChatAdminPageChatMATemplateView.as_view()),
]
