from django.urls import path

from homework.api_v2.views import HomeworkListAPIView

urlpatterns = [
    path('', HomeworkListAPIView.as_view()),
]
