from .views import (UserTelegramListAPIView, SendMaterialsTGView,
                    TgJournalPage, TgJournalListAPIView, TgJournalItemAPIView,
                    TelegramSettingsAPIView)
from .views_ma import UserLoginMAAPIView, ErrorPageMATemplateView
from django.urls import path

urlpatterns = [
    path('', TgJournalPage.as_view(), name='tgjournal'),
]

apiv1journalpatterns = [
    path('', TgJournalListAPIView.as_view()),
    path('<int:pk>', TgJournalItemAPIView.as_view()),
]

apiv1patterns = [
    path('<int:user_id>/', TelegramSettingsAPIView.as_view()),
    path('all/', UserTelegramListAPIView.as_view()),
    path('sendmaterial/', SendMaterialsTGView.as_view())
]

ma_patterns = [
    path('login/', UserLoginMAAPIView.as_view()),
    path('error/<str:err>/', ErrorPageMATemplateView.as_view()),
]
