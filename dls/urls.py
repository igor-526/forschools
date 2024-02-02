from django.contrib import admin
from django.urls import path, include
from profile_management.urls import urlpatterns as profile_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(profile_urlpatterns)),
]
