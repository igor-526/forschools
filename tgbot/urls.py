from .views import TgJournalPage
from .views_api import (UserTelegramListAPIView, SendMaterialsTGView, TgJournalListAPIView,
                        TgJournalItemAPIView, TelegramSettingsAPIView, TelegramSetMainAPIView)
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
    path('<int:pk>/set_main/', TelegramSetMainAPIView.as_view()),
    path('all/', UserTelegramListAPIView.as_view()),
    path('sendmaterial/', SendMaterialsTGView.as_view())
]

ma_patterns = [
    path('login/', UserLoginMAAPIView.as_view()),
    path('error/<str:err>/', ErrorPageMATemplateView.as_view()),
]
