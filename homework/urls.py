from django.urls import path
from .views import (HomeworkPage, HomeworkListCreateAPIView,
                    HomeworkItemPage, HomeworkLogListCreateAPIView)

urlpatterns = [
    path('', HomeworkPage.as_view(), name='homeworks'),    # страница с домашними заданиями
    path('<int:pk>', HomeworkItemPage.as_view()),
]

apiv1patterns = [
    path('', HomeworkListCreateAPIView.as_view()),
    path('<int:pk>/logs/', HomeworkLogListCreateAPIView.as_view()),
]
