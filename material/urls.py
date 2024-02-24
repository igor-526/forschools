from django.urls import path
from .views import MaterialPage, MaterialListView, MaterialCategoryView

urlpatterns = [
    path('', MaterialPage.as_view(), name='materials'),    # страница с материалами
]

apiv1patterns = [
    path('', MaterialListView.as_view()),
    path('category', MaterialCategoryView.as_view())
]
