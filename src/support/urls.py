from django.urls import path

from .views import SupportTicketsPage, TelegramErrorsPage, WSGIErrorsPage
from .views_api import (SupportTicketsListCreateAPIView,
                        TelegramErrorsListAPIView,
                        TelegramErrorsRetrieveAPIView,
                        TelegramErrorsSetStatusAPIView,
                        WSGIErrorsListAPIView,
                        WSGIErrorsRetrieveAPIView,
                        WSGIErrorsSetStatusAPIView)

urlpatterns = [
    path('wsgierrors', WSGIErrorsPage.as_view(), name='wsgierrors'),
    path('telegramerrors',
         TelegramErrorsPage.as_view(),
         name='telegramerrors'),
    path('tickets', SupportTicketsPage.as_view(), name='supporttickets'),
]

apiv1patterns = [
    path('wsgierrors/', WSGIErrorsListAPIView.as_view()),
    path('telegramerrors/', TelegramErrorsListAPIView.as_view()),
    path('telegramerrors/<int:pk>/', TelegramErrorsRetrieveAPIView.as_view()),
    path('telegramerrors/set_status/',
         TelegramErrorsSetStatusAPIView.as_view()),
    path('wsgierrors/<int:pk>/', WSGIErrorsRetrieveAPIView.as_view()),
    path('wsgierrors/set_status/', WSGIErrorsSetStatusAPIView.as_view()),
    path('tickets/', SupportTicketsListCreateAPIView.as_view()),
]
