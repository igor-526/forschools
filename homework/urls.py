from django.urls import path
from .views import (HomeworkPage, HomeworkListCreateAPIView,
                    HomeworkItemPage, HomeworkLogListCreateAPIView,
                    HomeworkReplaceTeacher)

urlpatterns = [
    path('', HomeworkPage.as_view(), name='homeworks'),    # страница с домашними заданиями
    path('<int:pk>', HomeworkItemPage.as_view()),
]

apiv1patterns = [
    path('', HomeworkListCreateAPIView.as_view()),
    path('<int:pk>/logs/', HomeworkLogListCreateAPIView.as_view()),
    path('<int:pk>/rt/', HomeworkReplaceTeacher.as_view()),
]
