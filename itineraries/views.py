import uuid
from datetime import datetime, timedelta
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.http import HttpResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from xhtml2pdf import pisa


from .models import Itinerary, ItineraryDay, ItineraryGroupPrice
from .serializers import ItinerarySerializer, ItineraryDaySerializer
from conditions.models import Inclusion, Exclusion, Policy
from hotels.models import Hotel
from places.models import Place

# Helper to parse dates safely
def _parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None

# --- STEP 1: General & Customer Info ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def itinerary_step1_view(request):
    customer_name = request.data.get('customer_name')
    contact_name = request.data.get('contact_name')
    event_title = request.data.get('event_title')
    trip_start_date = request.data.get('trip_start_date')
    trip_end_date = request.data.get('trip_end_date')
    
    inclusions = request.data.get('inclusions', [])  # list of IDs
    exclusions = request.data.get('exclusions', [])  # list of IDs
    policies = request.data.get('policies', [])      # list of IDs
    places = request.data.get('places', [])          # list of IDs

    if not all([customer_name, contact_name, event_title, trip_start_date, trip_end_date]):
        return Response({"error": "Please provide customer_name, contact_name, event_title, trip_start_date, and trip_end_date."}, status=status.HTTP_400_BAD_REQUEST)

    start_date = _parse_date(trip_start_date)
    end_date = _parse_date(trip_end_date)
    if not start_date or not end_date:
        return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

    if start_date > end_date:
        return Response({"error": "Trip start date must be before or equal to trip end date."}, status=status.HTTP_400_BAD_REQUEST)

    # Generate draft token
    draft_token = uuid.uuid4().hex
    
    draft_data = {
        'customer_name': customer_name,
        'contact_name': contact_name,
        'event_title': event_title,
        'trip_start_date': str(start_date),
        'trip_end_date': str(end_date),
        'inclusions': list(inclusions),
        'exclusions': list(exclusions),
        'policies': list(policies),
        'places': list(places),
    }

    # Store in Redis for 24 hours (86400 seconds)
    cache.set(f"itinerary_draft:{draft_token}", draft_data, timeout=86400)
    
    return Response({
        "message": "Itinerary general info stored in Redis draft successfully.",
        "draft_token": draft_token,
        "draft_data": draft_data
    }, status=status.HTTP_201_CREATED)


# --- STEP 2: Day-Wise Details ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def itinerary_step2_view(request):
    draft_token = request.data.get('draft_token')
    days = request.data.get('days', [])  # list of day dictionaries

    if not draft_token:
        return Response({"error": "Please provide draft_token."}, status=status.HTTP_400_BAD_REQUEST)

    draft_data = cache.get(f"itinerary_draft:{draft_token}")
    if not draft_data:
        return Response({"error": "Itinerary draft not found or expired. Please start over from Step 1."}, status=status.HTTP_400_BAD_REQUEST)

    start_date = _parse_date(draft_data['trip_start_date'])
    end_date = _parse_date(draft_data['trip_end_date'])

    expected_total_days = (end_date - start_date).days + 1

    if len(days) != expected_total_days:
        return Response({
            "error": f"The number of itinerary days ({len(days)}) does not match the trip duration ({expected_total_days} days, from {start_date} to {end_date})."
        }, status=status.HTTP_400_BAD_REQUEST)

    validated_days = []
    for index, day in enumerate(days):
        city = day.get('city')
        place = day.get('place')
        meal_plan = day.get('meal_plan')
        description = day.get('description', '')
        trip_day = day.get('trip_day')
        trip_date_str = day.get('trip_date')
        notes = day.get('notes', '')

        if not all([place, meal_plan, trip_day]):
            return Response({"error": f"Day entry at index {index} is missing required fields (place, meal_plan, trip_day)."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate meal plan choices
        if meal_plan:
            valid_meals = {'Breakfast', 'Lunch', 'Snacks', 'Dinner'}
            submitted_meals = [m.strip() for m in meal_plan.split(',') if m.strip()]
            for meal in submitted_meals:
                matched = None
                for vm in valid_meals:
                    if meal.lower() == vm.lower():
                        matched = vm
                        break
                if not matched:
                    return Response({"error": f"Invalid meal choice '{meal}' for day index {index}. Valid choices are Breakfast, Lunch, Snacks, Dinner."}, status=status.HTTP_400_BAD_REQUEST)


        # Validate that place is a valid Place UUID and retrieve it
        try:
            place_instance = Place.objects.get(id=place)
        except Place.DoesNotExist:
            return Response({"error": f"Place ID {place} for day index {index} does not exist in the database."}, status=status.HTTP_400_BAD_REQUEST)

        resolved_city = place_instance.city.name if place_instance.city else ""

        try:
            day_num = int(trip_day)
        except (ValueError, TypeError):
            return Response({"error": f"Invalid trip_day '{trip_day}' for day index {index}. It must be an integer."}, status=status.HTTP_400_BAD_REQUEST)

        if not (1 <= day_num <= expected_total_days):
            return Response({"error": f"trip_day {day_num} is out of range. It must be between 1 and {expected_total_days}."}, status=status.HTTP_400_BAD_REQUEST)

        # Day 1 set then directly set Day 2 (chronologically calculate date based on trip_day)
        calculated_date = start_date + timedelta(days=day_num - 1)

        if trip_date_str:
            provided_date = _parse_date(trip_date_str)
            if not provided_date:
                return Response({"error": f"Invalid date format for day index {index}. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
            if provided_date != calculated_date:
                return Response({
                    "error": f"Trip date {trip_date_str} for Day {day_num} does not match the chronological date {calculated_date}."
                }, status=status.HTTP_400_BAD_REQUEST)

        day_date = calculated_date

        validated_days.append({
            'city': resolved_city,
            'place': place,
            'meal_plan': meal_plan,
            'description': description,
            'trip_day': day_num,
            'trip_date': str(day_date),
            'notes': notes
        })

    # Ensure no duplicate trip_day entries
    submitted_day_nums = [d['trip_day'] for d in validated_days]
    if len(submitted_day_nums) != len(set(submitted_day_nums)):
        return Response({"error": "Duplicate trip_day entries are not allowed."}, status=status.HTTP_400_BAD_REQUEST)

    # Sort validated_days by trip_day
    validated_days.sort(key=lambda x: x['trip_day'])

    # Store validated days list in Redis for 24 hours
    cache.set(f"itinerary_draft_days:{draft_token}", validated_days, timeout=86400)

    return Response({
        "message": "Itinerary day-wise details stored in Redis draft successfully.",
        "draft_token": draft_token,
        "days": validated_days
    }, status=status.HTTP_200_OK)


# --- STEP 3: Pricing & Submit to Database ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def itinerary_submit_view(request):
    draft_token = request.data.get('draft_token')
    groups = request.data.get('groups', [])  # list of group price dicts

    if not draft_token:
        return Response({"error": "Please provide draft_token."}, status=status.HTTP_400_BAD_REQUEST)

    # 1. Retrieve draft records from Redis
    draft_data = cache.get(f"itinerary_draft:{draft_token}")
    draft_days = cache.get(f"itinerary_draft_days:{draft_token}")

    if not draft_data:
        return Response({"error": "Itinerary draft general information not found or expired. Please start over from Step 1."}, status=status.HTTP_400_BAD_REQUEST)

    if not draft_days:
        return Response({"error": "Itinerary draft day-wise details not found. Please complete Step 2 first."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create Itinerary in DB
        itinerary = Itinerary.objects.create(
            customer_name=draft_data['customer_name'],
            contact_name=draft_data['contact_name'],
            event_title=draft_data['event_title'],
            trip_start_date=_parse_date(draft_data['trip_start_date']),
            trip_end_date=_parse_date(draft_data['trip_end_date'])
        )

        # Link ManyToMany relationships
        if draft_data.get('inclusions'):
            itinerary.inclusions.add(*draft_data['inclusions'])
        if draft_data.get('exclusions'):
            itinerary.exclusions.add(*draft_data['exclusions'])
        if draft_data.get('policies'):
            itinerary.policies.add(*draft_data['policies'])
        if draft_data.get('places'):
            itinerary.places.add(*draft_data['places'])

        # Create ItineraryGroupPrice child configurations
        for g in groups:
            pkg_hotel = None
            pkg_hotel_id = g.get('hotel')
            if pkg_hotel_id:
                pkg_hotel = Hotel.objects.get(pk=pkg_hotel_id)
                
            ItineraryGroupPrice.objects.create(
                itinerary=itinerary,
                group_size=int(g.get('group_size', 1)),
                hotel=pkg_hotel,
                hotel_price=float(g.get('hotel_price', 0.00)),
                meal_price=float(g.get('meal_price', 0.00)),
                meals_included=g.get('meals_included'),
                travel_price=float(g.get('travel_price', 0.00)),
                travel_type=g.get('travel_type'),
                other_charges=float(g.get('other_charges', 0.00)),
                other_charge_type=g.get('other_charge_type')
            )

        # Create ItineraryDay objects
        itinerary_days_instances = []
        for day in draft_days:
            place_instance = Place.objects.get(pk=day['place'])
            itinerary_days_instances.append(
                ItineraryDay(
                    itinerary=itinerary,
                    city=place_instance.city,
                    place=place_instance,
                    meal_plan=day['meal_plan'],
                    description=day['description'],
                    trip_day=day['trip_day'],
                    trip_date=_parse_date(day['trip_date']),
                    notes=day['notes']
                )
            )
        ItineraryDay.objects.bulk_create(itinerary_days_instances)

        # Clear Redis draft keys
        cache.delete(f"itinerary_draft:{draft_token}")
        cache.delete(f"itinerary_draft_days:{draft_token}")

        # Serialize and return the saved Itinerary
        serializer = ItinerarySerializer(itinerary)
        return Response({
            "message": "Itinerary successfully finalized and saved to database.",
            "itinerary": serializer.data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": f"Failed to save itinerary to database: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- GENERAL CRUD ---
@api_view(['GET'])
@permission_classes([AllowAny])
def itinerary_list_view(request):
    itineraries = Itinerary.objects.all()
    serializer = ItinerarySerializer(itineraries, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'DELETE'])
@permission_classes([AllowAny])
def itinerary_detail_view(request, pk):
    itinerary = get_object_or_404(Itinerary, pk=pk)
    
    if request.method == 'GET':
        serializer = ItinerarySerializer(itinerary)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    elif request.method == 'DELETE':
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        itinerary.delete()
        return Response({"message": "Itinerary deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([AllowAny])
def itinerary_pdf_view(request, pk):
    itinerary = get_object_or_404(Itinerary, pk=pk)
    
    # Pre-process day-wise information
    for day in itinerary.days.all():
        # Format date as: 22 May (Fri)
        if day.trip_date:
            day.trip_date_formatted = day.trip_date.strftime("%d %b (%a)")
        else:
            day.trip_date_formatted = ""
            
        # Get absolute local photo path for xhtml2pdf to render
        if day.place and day.place.photo and hasattr(day.place.photo, 'path'):
            import os
            if os.path.exists(day.place.photo.path):
                day.absolute_photo_path = day.place.photo.path
            else:
                day.absolute_photo_path = None
        else:
            day.absolute_photo_path = None

    context = {
        'itinerary': itinerary,
        'current_date': datetime.now().strftime("%d/%m/%Y"),
        'from_user': request.user.username if request.user and request.user.is_authenticated else "rahul"
    }
    
    html_string = render_to_string('itineraries/itinerary_pdf.html', context)
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="itinerary_{itinerary.id}.pdf"'
    
    pisa_status = pisa.CreatePDF(html_string, dest=response)
    if pisa_status.err:
        return Response({"error": "Failed to generate PDF"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    return response
