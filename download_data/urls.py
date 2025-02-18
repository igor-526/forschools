from django.urls import path
from .views import GeneratedPage
from .views_api import GeneratedListAPIView

urlpatterns = [
    path('', GeneratedPage.as_view(), name='generated'),
]

api_v1_patterns = [
    path('', GeneratedListAPIView.as_view()),
]

ma_patterns = [

]
