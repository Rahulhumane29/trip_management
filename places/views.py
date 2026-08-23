from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from .models import Place, Country, State, City
from .serializers import PlaceSerializer, CountrySerializer, StateSerializer, CitySerializer

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def place_list_create_view(request):
    if request.method == 'GET':
        city = request.query_params.get('city')
        if city:
            places = Place.objects.filter(city__iexact=city)
        else:
            places = Place.objects.all()
        serializer = PlaceSerializer(places, many=True)
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
                
        serializer = PlaceSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def place_detail_view(request, pk):
    place = get_object_or_404(Place, pk=pk)
    
    if request.method == 'GET':
        serializer = PlaceSerializer(place)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    elif request.method in ['PUT', 'DELETE']:
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
            
        if request.method == 'PUT':
            serializer = PlaceSerializer(place, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        elif request.method == 'DELETE':
            place.delete()
            return Response({"message": "Place deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def country_list_create_view(request):
    if request.method == 'GET':
        countries = Country.objects.all()
        serializer = CountrySerializer(countries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = CountrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def state_list_create_view(request):
    if request.method == 'GET':
        country_name = request.query_params.get('country')
        if country_name:
            states = State.objects.filter(country__name__iexact=country_name)
        else:
            states = State.objects.all()
        serializer = StateSerializer(states, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        country_id = request.data.get('country')
        if not country_id:
            country_name = request.data.get('country_name')
            if country_name:
                country, _ = Country.objects.get_or_create(name=country_name)
                request.data['country'] = str(country.id)

        serializer = StateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def city_list_create_view(request):
    if request.method == 'GET':
        country_name = request.query_params.get('country')
        state_name = request.query_params.get('state')
        queryset = City.objects.all()
        if country_name:
            queryset = queryset.filter(country__name__iexact=country_name)
        if state_name:
            queryset = queryset.filter(state__name__iexact=state_name)
        serializer = CitySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        country_name = request.data.get('country_name')
        state_name = request.data.get('state_name')
        
        if country_name:
            country, _ = Country.objects.get_or_create(name=country_name)
            request.data['country'] = str(country.id)
            if state_name:
                state, _ = State.objects.get_or_create(name=state_name, country=country)
                request.data['state'] = str(state.id)
        
        serializer = CitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
