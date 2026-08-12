from rest_framework import serializers
from .models import Itinerary, ItineraryDay, ItineraryGroupPrice
from conditions.serializers import InclusionSerializer, ExclusionSerializer, PolicySerializer
from hotels.serializers import HotelSerializer
from places.serializers import PlaceSerializer

class ItineraryDaySerializer(serializers.ModelSerializer):
    place_details = PlaceSerializer(source='place', read_only=True)

    class Meta:
        model = ItineraryDay
        fields = '__all__'
        read_only_fields = ('itinerary',)


class ItineraryGroupPriceSerializer(serializers.ModelSerializer):
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
    places_details = PlaceSerializer(source='places', many=True, read_only=True)
    hotel_details = HotelSerializer(source='hotel', read_only=True)

    class Meta:
        model = Itinerary
        fields = '__all__'
