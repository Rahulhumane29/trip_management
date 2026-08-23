from django.urls import path
from .views import (
    place_list_create_view, 
    place_detail_view,
    country_list_create_view,
    state_list_create_view,
    city_list_create_view
)

urlpatterns = [
    path('', place_list_create_view, name='place_list_create'),
    path('countries/', country_list_create_view, name='country_list_create'),
    path('states/', state_list_create_view, name='state_list_create'),
    path('cities/', city_list_create_view, name='city_list_create'),
    path('<str:pk>/', place_detail_view, name='place_detail'),
]
