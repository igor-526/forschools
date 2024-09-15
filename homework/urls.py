from django.urls import path
from .views import (HomeworksPage, HomeworkListCreateAPIView,
                    HomeworkItemPage, HomeworkLogListCreateAPIView,
                    HomeworkReplaceTeacher, HomeworkSetCancelledAPIView,
                    HomeworkItemPageInfoAPIView, HomeworkItemPageEditAPIView)

urlpatterns = [
    path('', HomeworksPage.as_view(), name='homeworks'),    # страница с домашними заданиями
    path('<int:pk>', HomeworkItemPage.as_view()),
]

apiv1patterns = [
    path('', HomeworkListCreateAPIView.as_view()),
    path('<int:pk>/info/', HomeworkItemPageInfoAPIView.as_view()),
    path('<int:pk>/edit/', HomeworkItemPageEditAPIView.as_view()),
    path('<int:pk>/logs/', HomeworkLogListCreateAPIView.as_view()),
    path('<int:pk>/rt/', HomeworkReplaceTeacher.as_view()),
    path('<int:pk>/set_cancelled/', HomeworkSetCancelledAPIView.as_view()),
]
