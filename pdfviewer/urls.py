from django.urls import path
from .views import PDFPageView

urlpatterns = [
    path('<str:where>/<int:pk>/', PDFPageView.as_view()),  # показ PDF файла
]
