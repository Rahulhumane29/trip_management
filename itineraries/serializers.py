from rest_framework import serializers
from .models import Itinerary, ItineraryDay, ItineraryGroupPrice, ItineraryItem
from conditions.serializers import InclusionSerializer, ExclusionSerializer, PolicySerializer, ImportantNoteSerializer
from hotels.serializers import HotelSerializer
from places.serializers import PlaceSerializer, CitySerializer
 
class ItineraryItemSerializer(serializers.ModelSerializer):
    city_details = CitySerializer(source='city', read_only=True)
    place_details = PlaceSerializer(source='place', read_only=True)
    places_details = PlaceSerializer(source='places', many=True, read_only=True)
    from_city_details = CitySerializer(source='from_city', read_only=True)
    to_city_details = CitySerializer(source='to_city', read_only=True)

    class Meta:
        model = ItineraryItem
        fields = '__all__'


class ItineraryDaySerializer(serializers.ModelSerializer):
    place_details = PlaceSerializer(source='place', read_only=True)
    city_details = CitySerializer(source='city', read_only=True)
    items = ItineraryItemSerializer(many=True, read_only=True)

    class Meta:
        model = ItineraryDay
        fields = '__all__'
        read_only_fields = ('itinerary',)


class ItineraryGroupPriceSerializer(serializers.ModelSerializer):
    hotel_details = HotelSerializer(source='hotel', read_only=True)

    class Meta:
        model = ItineraryGroupPrice
        fields = '__all__'
        read_only_fields = ('itinerary',)


class ItinerarySerializer(serializers.ModelSerializer):
    days = ItineraryDaySerializer(many=True, read_only=True)
    group_prices = ItineraryGroupPriceSerializer(many=True, read_only=True)
    inclusions_details = InclusionSerializer(source='inclusions', many=True, read_only=True)
    exclusions_details = ExclusionSerializer(source='exclusions', many=True, read_only=True)
    policies_details = PolicySerializer(source='policies', many=True, read_only=True)
    important_notes_details = ImportantNoteSerializer(source='important_notes', many=True, read_only=True)
    places_details = PlaceSerializer(source='places', many=True, read_only=True)
    hotel_details = HotelSerializer(source='hotel', read_only=True)

    class Meta:
        model = Itinerary
        fields = '__all__'


class TripInventorySerializer(serializers.ModelSerializer):
    duration = serializers.SerializerMethodField()
    cities = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    trip_title = serializers.CharField(source='event_title')
    start_date = serializers.DateField(source='trip_start_date')
    end_date = serializers.DateField(source='trip_end_date')
    contact_number = serializers.CharField(source='contact_name')

    class Meta:
        model = Itinerary
        fields = [
            'id', 'customer_name', 'contact_number', 'trip_title',
            'start_date', 'end_date', 'duration', 'cities',
            'total_amount', 'created_at', 'status'
        ]

    def get_duration(self, obj):
        if obj.trip_start_date and obj.trip_end_date:
            return (obj.trip_end_date - obj.trip_start_date).days + 1
        return 0

    def get_cities(self, obj):
        cities = []
        for day in obj.days.all().order_by('trip_day'):
            if day.city and day.city.name not in cities:
                cities.append(day.city.name)
            for item in day.items.all().order_by('sequence'):
                if item.city and item.city.name not in cities:
                    cities.append(item.city.name)
        return cities

    def get_total_amount(self, obj):
        first_group = obj.group_prices.first()
        if first_group:
            return first_group.total_group_price
        return 0.00

    def get_status(self, obj):
        return "Confirmed"