from django.urls import path
from .views import ChatPageTemplateView, ChatUsersListView, ChatMessagedListCreateAPIView

urlpatterns = [
    path('', ChatPageTemplateView.as_view(), name='chats'),
]

apiv1patterns = [
    path('', ChatUsersListView.as_view()),
    path('<int:user>', ChatMessagedListCreateAPIView.as_view()),
]
