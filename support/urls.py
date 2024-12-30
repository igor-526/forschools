from django.urls import path
from .views import WSGIErrorsPage, SupportTicketsPage
from .views_api import (WSGIErrorsListAPIView, WSGIErrorsRetrieveUpdateAPIView,
                        SupportTicketsListCreateAPIView, WSGIErrorsSetStatusAPIView)

urlpatterns = [
    path('wsgierrors', WSGIErrorsPage.as_view(), name='wsgierrors'),
    path('tickets', SupportTicketsPage.as_view(), name='supporttickets'),
]

apiv1patterns = [
    path('wsgierrors/', WSGIErrorsListAPIView.as_view()),
    path('wsgierrors/<int:pk>/', WSGIErrorsRetrieveUpdateAPIView.as_view()),
    path('wsgierrors/set_status/', WSGIErrorsSetStatusAPIView.as_view()),
    path('tickets/', SupportTicketsListCreateAPIView.as_view()),
]
