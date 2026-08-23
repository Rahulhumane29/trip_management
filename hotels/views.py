from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Hotel
from .serializers import HotelSerializer
from places.models import Country, State, City

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def hotel_list_create_view(request):
    if request.method == 'GET':
        hotels = Hotel.objects.all()
        serializer = HotelSerializer(hotels, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
            
        data = request.data.copy()
        country_name = data.get('country_name')
        state_name = data.get('state_name')
        city_name = data.get('city_name')
        
        if country_name:
            country, _ = Country.objects.get_or_create(name=country_name)
            data['country'] = str(country.id)
            if state_name:
                state, _ = State.objects.get_or_create(name=state_name, country=country)
                data['state'] = str(state.id)
                if city_name:
                    city, _ = City.objects.get_or_create(name=city_name, state=state, country=country)
                    data['city'] = str(city.id)
            elif city_name:
                city, _ = City.objects.get_or_create(name=city_name, country=country)
                data['city'] = str(city.id)
                
        serializer = HotelSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def hotel_detail_view(request, pk):
    hotel = get_object_or_404(Hotel, pk=pk)
    
    if request.method == 'GET':
        serializer = HotelSerializer(hotel)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    elif request.method in ['PUT', 'DELETE']:
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
            
        if request.method == 'PUT':
            data = request.data.copy()
            country_name = data.get('country_name')
            state_name = data.get('state_name')
            city_name = data.get('city_name')
            
            if country_name:
                country, _ = Country.objects.get_or_create(name=country_name)
                data['country'] = str(country.id)
                if state_name:
                    state, _ = State.objects.get_or_create(name=state_name, country=country)
                    data['state'] = str(state.id)
                    if city_name:
                        city, _ = City.objects.get_or_create(name=city_name, state=state, country=country)
                        data['city'] = str(city.id)
                elif city_name:
                    city, _ = City.objects.get_or_create(name=city_name, country=country)
                    data['city'] = str(city.id)
            
            serializer = HotelSerializer(hotel, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        elif request.method == 'DELETE':
            hotel.delete()
            return Response({"message": "Hotel deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
