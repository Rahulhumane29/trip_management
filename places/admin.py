from django.contrib import admin
from .models import Place

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ('place_name', 'city', 'country', 'created_at')
    list_filter = ('city', 'country')
    search_fields = ('place_name', 'city', 'country', 'description')
    ordering = ('-created_at',)
