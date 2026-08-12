from django.contrib import admin
from .models import Hotel

@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'country', 'star_rating', 'is_active', 'created_at')
    list_filter = ('city', 'country', 'star_rating', 'is_active')
    search_fields = ('name', 'city', 'country', 'description')
    ordering = ('-created_at',)
