from django.urls import path
from .views import (
    inclusion_list_create_view, inclusion_detail_view,
    exclusion_list_create_view, exclusion_detail_view,
    policy_list_create_view, policy_detail_view,
    important_note_list_create_view, important_note_detail_view
)

urlpatterns = [
    # Inclusions
    path('inclusions/', inclusion_list_create_view, name='inclusion_list_create'),
    path('inclusions/<str:pk>/', inclusion_detail_view, name='inclusion_detail'),

    # Exclusions
    path('exclusions/', exclusion_list_create_view, name='exclusion_list_create'),
    path('exclusions/<str:pk>/', exclusion_detail_view, name='exclusion_detail'),

    # Policies
    path('policies/', policy_list_create_view, name='policy_list_create'),
    path('policies/<str:pk>/', policy_detail_view, name='policy_detail'),

    # Important Notes
    path('important_notes/', important_note_list_create_view, name='important_note_list_create'),
    path('important_notes/<str:pk>/', important_note_detail_view, name='important_note_detail'),
]
