from django.urls import path
from .views import HomeworkPage

urlpatterns = [
    path('', HomeworkPage.as_view(), name='homeworks'),    # страница с домашними заданиями
]
