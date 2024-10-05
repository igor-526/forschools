from django.urls import path
from .views import (WSGIErrorsPage, WSGIErrorsListAPIView,
                    WSGIErrorsRetrieveUpdateAPIView, SupportTicketsListCreateAPIView,
                    SupportTicketsPage)

urlpatterns = [
    path('wsgierrors', WSGIErrorsPage.as_view(), name='wsgierrors'),
    path('tickets', SupportTicketsPage.as_view(), name='supporttickets'),
]

apiv1patterns = [
    path('wsgierrors/', WSGIErrorsListAPIView.as_view()),
    path('wsgierrors/<int:pk>/', WSGIErrorsRetrieveUpdateAPIView.as_view()),
    path('tickets/', SupportTicketsListCreateAPIView.as_view()),
]