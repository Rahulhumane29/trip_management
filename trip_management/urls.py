"""
URL configuration for trip_management project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from authentication.views import (
    register_view, 
    user_profile_view, 
    verify_email_view,
    login_view,
    create_company_user_view
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', register_view, name='auth_register'),
    path('api/verify-email/', verify_email_view, name='verify_email'),
    path('api/login/', login_view, name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/profile/', user_profile_view, name='user_profile'),
    path('api/company/users/create/', create_company_user_view, name='create_company_user'),
    path('api/hotels/', include('hotels.urls')),
    path('api/places/', include('places.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/conditions/', include('conditions.urls')),
    path('api/itinerary/', include('itineraries.urls')),
]

