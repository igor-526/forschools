from django.urls import path
from .views import LessonPage

urlpatterns = [
    path('', LessonPage.as_view(), name='lessons'),
]

apiv1patterns = [

]
