from django.urls import path
from .views import (MaterialPage,
                    MaterialListView,
                    MaterialAPIView,
                    MaterialCategoryView,
                    MaterialItemPage)

urlpatterns = [
    path('', MaterialPage.as_view(), name='materials'),    # страница с материалами
    path('<int:pk>', MaterialItemPage.as_view()),    # страница материала
]

apiv1patterns = [
    path('', MaterialListView.as_view()),
    path('category', MaterialCategoryView.as_view()),
    path('<int:pk>', MaterialAPIView.as_view()),
]
