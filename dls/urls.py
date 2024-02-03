from django.contrib import admin
from django.urls import path, include
from profile_management.urls import urlpatterns as profile_urlpatterns
from material.urls import urlpatterns as material_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(profile_urlpatterns)),
    path('materials/', include(material_urlpatterns))
]
