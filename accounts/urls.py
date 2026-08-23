from django.urls import path
from .views import account_list_create_view, account_detail_view, associate_account_view

urlpatterns = [
    path('', account_list_create_view, name='account_list_create'),
    path('<str:pk>/', account_detail_view, name='account_detail'),
    path('associate/', associate_account_view, name='account_associate'),
]
