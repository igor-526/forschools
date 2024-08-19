from .views import (UserTelegramListAPIView, SendMaterialsTGView,
                    TgJournalPage, TgJournalListAPIView, TgJournalItemAPIView)
from django.urls import path

urlpatterns = [
    path('', TgJournalPage.as_view(), name='tgjournal'),
]

apiv1journalpatterns = [
    path('', TgJournalListAPIView.as_view()),
    path('<int:pk>', TgJournalItemAPIView.as_view()),
]

apiv1patterns = [
    path('all/', UserTelegramListAPIView.as_view()),  # API для вывода списка пользователей c TG
    path('sendmaterial/', SendMaterialsTGView.as_view())
]
