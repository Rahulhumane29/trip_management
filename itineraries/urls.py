from django.urls import path
from .views import (
    itinerary_step1_view,
    itinerary_step2_view,
    itinerary_submit_view,
    itinerary_list_view,
    itinerary_detail_view,
    itinerary_pdf_view,
    trip_inventory_view
)

app_name = 'itineraries'

urlpatterns = [
    path('step1/', itinerary_step1_view, name='itinerary_step1'),
    path('step2/', itinerary_step2_view, name='itinerary_step2'),
    path('submit/', itinerary_submit_view, name='itinerary_submit'),
    path('inventory/', trip_inventory_view, name='trip_inventory'),
    path('', itinerary_list_view, name='itinerary_list'),
    path('<uuid:pk>/', itinerary_detail_view, name='itinerary_detail'),
    path('<uuid:pk>/pdf/', itinerary_pdf_view, name='itinerary_pdf'),
]
