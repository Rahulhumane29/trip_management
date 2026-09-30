from django.contrib import admin
from .models import Itinerary, ItineraryDay, ItineraryGroupPrice, ItineraryItem

class ItineraryItemInline(admin.TabularInline):
    model = ItineraryItem
    extra = 0
    autocomplete_fields = ['places', 'place', 'city']


class ItineraryDayInline(admin.StackedInline):
    model = ItineraryDay
    extra = 0
    filter_horizontal = ('places',)
    autocomplete_fields = ['city', 'place']


class ItineraryGroupPriceInline(admin.TabularInline):
    model = ItineraryGroupPrice
    extra = 1


@admin.register(ItineraryDay)
class ItineraryDayAdmin(admin.ModelAdmin):
    list_display = ('trip_day', 'itinerary', 'city', 'trip_date', 'display_places')
    list_filter = ('itinerary', 'city')
    search_fields = ('itinerary__event_title', 'city__name', 'places__place_name')
    filter_horizontal = ('places',)
    autocomplete_fields = ['city', 'place']
    inlines = [ItineraryItemInline]

    def display_places(self, obj):
        places = list(obj.places.all())
        if places:
            return ", ".join(p.place_name for p in places)
        return obj.place.place_name if obj.place else "-"
    display_places.short_description = "Places"


@admin.register(ItineraryItem)
class ItineraryItemAdmin(admin.ModelAdmin):
    list_display = ('item_type', 'itinerary_day', 'city', 'display_places', 'sequence')
    list_filter = ('item_type', 'city')
    search_fields = ('description', 'places__place_name')
    filter_horizontal = ('places',)
    autocomplete_fields = ['city', 'place']

    def display_places(self, obj):
        places = list(obj.places.all())
        if places:
            return ", ".join(p.place_name for p in places)
        return obj.place.place_name if obj.place else "-"
    display_places.short_description = "Places"


@admin.register(Itinerary)
class ItineraryAdmin(admin.ModelAdmin):
    list_display = ('event_title', 'customer_name', 'contact_name', 'trip_start_date', 'trip_end_date', 'created_at')
    list_filter = ('trip_start_date', 'trip_end_date')
    search_fields = ('event_title', 'customer_name', 'contact_name')
    filter_horizontal = ('places', 'inclusions', 'exclusions', 'policies', 'important_notes')
    inlines = [ItineraryDayInline, ItineraryGroupPriceInline]
    ordering = ('-created_at',)
