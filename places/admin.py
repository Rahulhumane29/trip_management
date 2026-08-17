from django.contrib import admin
from .models import Place, Country, State, City

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)

@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'created_at')
    list_filter = ('country',)
    search_fields = ('name',)

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('name', 'state', 'country', 'created_at')
    list_filter = ('country', 'state')
    search_fields = ('name',)

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ('place_name', 'city', 'country', 'created_at')
    list_filter = ('city', 'country')
    search_fields = ('place_name', 'city__name', 'country__name', 'description')
    ordering = ('-created_at',)
