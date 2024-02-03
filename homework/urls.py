from django.urls import path
from .views import HomeworkPage, HomeworkAddPage

urlpatterns = [
    path('', HomeworkPage.as_view(), name='homeworks'),    # страница с домашними заданиями
    path('add', HomeworkAddPage.as_view(), name='homeworks_add'),   # страница для добавления домашнего задания
]
