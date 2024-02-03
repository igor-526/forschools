from django.urls import path
from .views import MaterialPage, MaterialAddPage, material_add, category_add

urlpatterns = [
    path('', MaterialPage.as_view(), name='materials'),    # страница с материалами
    path('add', MaterialAddPage.as_view(), name='materials_add'),   # страница для добавления материала и категории
    path('add/category', category_add, name='add_category'),    # служебный метод добавления категории
    path('add/material', material_add, name='add_material'),    # служебный метод добавления материала
]
