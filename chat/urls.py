from django.urls import path
from .views import ChatPageTemplateView, ChatUsersListView, ChatMessagesListCreateAPIView

urlpatterns = [
    path('', ChatPageTemplateView.as_view(), name='chats'),
]

apiv1patterns = [
    path('', ChatUsersListView.as_view()),
    path('<int:user>/', ChatMessagesListCreateAPIView.as_view()),
]
