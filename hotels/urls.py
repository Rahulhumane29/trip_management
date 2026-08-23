from django.urls import path
from .views import hotel_list_create_view, hotel_detail_view

urlpatterns = [
    path('', hotel_list_create_view, name='hotel_list_create'),
    path('<str:pk>/', hotel_detail_view, name='hotel_detail'),
]
