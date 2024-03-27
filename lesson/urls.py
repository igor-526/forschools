from django.urls import path
from .views import LessonPage

urlpatterns = [
    path('', LessonPage.as_view(), name='lessons'),    # страница с материалами
]

apiv1patterns = [

]
