from django.urls import path
from .views import WSGIErrorsPage, SupportTicketsPage, TelegramErrorsPage
from .views_api import (WSGIErrorsListAPIView, WSGIErrorsRetrieveAPIView,
                        SupportTicketsListCreateAPIView, WSGIErrorsSetStatusAPIView,
                        TelegramErrorsListAPIView, TelegramErrorsRetrieveAPIView,
                        TelegramErrorsSetStatusAPIView)

urlpatterns = [
    path('wsgierrors', WSGIErrorsPage.as_view(), name='wsgierrors'),
    path('telegramerrors', TelegramErrorsPage.as_view(), name='telegramerrors'),
    path('tickets', SupportTicketsPage.as_view(), name='supporttickets'),
]

apiv1patterns = [
    path('wsgierrors/', WSGIErrorsListAPIView.as_view()),
    path('telegramerrors/', TelegramErrorsListAPIView.as_view()),
    path('telegramerrors/<int:pk>/', TelegramErrorsRetrieveAPIView.as_view()),
    path('telegramerrors/set_status/', TelegramErrorsSetStatusAPIView.as_view()),
    path('wsgierrors/<int:pk>/', WSGIErrorsRetrieveAPIView.as_view()),
    path('wsgierrors/set_status/', WSGIErrorsSetStatusAPIView.as_view()),
    path('tickets/', SupportTicketsListCreateAPIView.as_view()),
]
