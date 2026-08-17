from rest_framework import serializers
from .models import Place, Country, State, City

class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = '__all__'

class StateSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)
    class Meta:
        model = State
        fields = '__all__'

class CitySerializer(serializers.ModelSerializer):
    state_name = serializers.CharField(source='state.name', read_only=True)
    country_name = serializers.CharField(source='country.name', read_only=True)
    class Meta:
        model = City
        fields = '__all__'

class PlaceSerializer(serializers.ModelSerializer):
    city_details = CitySerializer(source='city', read_only=True)
    state_details = StateSerializer(source='state', read_only=True)
    country_details = CountrySerializer(source='country', read_only=True)

    class Meta:
        model = Place
        fields = '__all__'
