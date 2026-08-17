from rest_framework import serializers
from .models import Hotel
from places.serializers import CitySerializer, StateSerializer, CountrySerializer

class HotelSerializer(serializers.ModelSerializer):
    city_details = CitySerializer(source='city', read_only=True)
    state_details = StateSerializer(source='state', read_only=True)
    country_details = CountrySerializer(source='country', read_only=True)

    class Meta:
        model = Hotel
        fields = '__all__'

    def validate_star_rating(self, value):
        if value is not None and (value < 1 or value > 5):
            raise serializers.ValidationError("Star rating must be between 1 and 5.")
        return value
