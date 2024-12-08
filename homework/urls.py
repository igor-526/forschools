from django.urls import path
from .views import HomeworksPage, HomeworkItemPage
from .views_api import (HomeworkListCreateAPIView, HomeworkLogListCreateAPIView,
                        HomeworkReplaceTeacherAPIView, HomeworkSetCancelledAPIView,
                        HomeworkItemPageInfoAPIView, HomeworkItemPageEditAPIView,
                        HomeworkLogAPIView, HomeworkRetrieveUpdateDestroyAPIView)
from .views_ma import HomeworkItemMAPage

urlpatterns = [
    path('', HomeworksPage.as_view(), name='homeworks'),
    path('<int:pk>', HomeworkItemPage.as_view()),
]

apiv1patterns = [
    path('', HomeworkListCreateAPIView.as_view()),
    path('<int:pk>/', HomeworkRetrieveUpdateDestroyAPIView.as_view()),
    path('<int:pk>/info/', HomeworkItemPageInfoAPIView.as_view()),
    path('<int:pk>/edit/', HomeworkItemPageEditAPIView.as_view()),
    path('<int:pk>/logs/', HomeworkLogListCreateAPIView.as_view()),
    path('<int:pk>/rt/', HomeworkReplaceTeacherAPIView.as_view()),
    path('<int:pk>/set_cancelled/', HomeworkSetCancelledAPIView.as_view()),
    path('logs/<int:pk>/', HomeworkLogAPIView.as_view()),
]

ma_patterns = [
    path('<int:pk>/', HomeworkItemMAPage.as_view()),
]
