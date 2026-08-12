from django.urls import path
from .views import place_list_create_view, place_detail_view

urlpatterns = [
    path('', place_list_create_view, name='place_list_create'),
    path('<int:pk>/', place_detail_view, name='place_detail'),
]
