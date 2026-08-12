from rest_framework import serializers
from .models import Hotel

class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = '__all__'

    def validate_star_rating(self, value):
        if value is not None and (value < 1 or value > 5):
            raise serializers.ValidationError("Star rating must be between 1 and 5.")
        return value
