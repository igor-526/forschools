from django.urls import path
from .views import UserLogsPageTemplateView
from .views_api import UserLogsActionsAPIView, UserLogsMessagesUsersAPIVIew, UserLogsMessagesChatAPIVIew

urlpatterns = [
    path('', UserLogsPageTemplateView.as_view(), name='user_logs'),
]

api_v1_patterns = [
    path('plan<int:plan_pk>/', UserLogsActionsAPIView.as_view()),
    path('plan<int:plan_pk>/messages/', UserLogsMessagesUsersAPIVIew.as_view()),
    path('messages/', UserLogsMessagesChatAPIVIew.as_view()),
    path('', UserLogsActionsAPIView.as_view()),
]

ma_patterns = [

]
