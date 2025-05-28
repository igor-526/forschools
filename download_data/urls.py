from django.urls import path
from .views import GeneratedPage
from .views_api import GeneratedListAPIView, GenerateNewData

urlpatterns = [
    path('', GeneratedPage.as_view(), name='generated'),
]

api_v1_patterns = [
    path('', GeneratedListAPIView.as_view()),
    path('download/<str:mode>/', GenerateNewData.as_view()),
]
