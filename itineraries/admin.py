from django.contrib import admin
from .models import Itinerary, ItineraryDay, ItineraryGroupPrice

class ItineraryDayInline(admin.TabularInline):
    model = ItineraryDay
    extra = 1


class ItineraryGroupPriceInline(admin.TabularInline):
    model = ItineraryGroupPrice
    extra = 1


@admin.register(Itinerary)
class ItineraryAdmin(admin.ModelAdmin):
    list_display = ('event_title', 'customer_name', 'contact_name', 'trip_start_date', 'trip_end_date', 'created_at')
    list_filter = ('trip_start_date', 'trip_end_date')
    search_fields = ('event_title', 'customer_name', 'contact_name')
    inlines = [ItineraryDayInline, ItineraryGroupPriceInline]
    ordering = ('-created_at',)
