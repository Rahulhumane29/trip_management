import os
import uuid
from datetime import datetime, timedelta
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.http import HttpResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from xhtml2pdf import pisa


from .models import Itinerary, ItineraryDay, ItineraryGroupPrice, ItineraryItem
from .serializers import ItinerarySerializer, ItineraryDaySerializer
from conditions.models import Inclusion, Exclusion, Policy
from hotels.models import Hotel
from places.models import Place, City

# Helper to parse dates safely
def _parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None

# Helper to parse times safely
def _parse_time(time_str):
    if not time_str:
        return None
    for fmt in ("%H:%M:%S", "%H:%M", "%I:%M %p", "%I:%M%p", "%H:%M %p", "%H:%M%p"):
        try:
            return datetime.strptime(time_str.strip(), fmt).time()
        except (ValueError, TypeError):
            continue
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
    important_notes = request.data.get('important_notes', [])  # list of IDs
    places = request.data.get('places', [])          # list of IDs

    if not all([customer_name, contact_name, event_title, trip_start_date, trip_end_date]):
        return Response({"error": "Please provide customer_name, contact_name, event_title, trip_start_date, and trip_end_date."}, status=status.HTTP_400_BAD_REQUEST)

    import re
    if not re.match(r'^[a-zA-Z\s]+$', customer_name):
        return Response({"error": "Customer name must contain only letters and spaces."}, status=status.HTTP_400_BAD_REQUEST)
    if len(customer_name.strip()) < 3:
        return Response({"error": "Customer name must be at least 3 characters long."}, status=status.HTTP_400_BAD_REQUEST)

    if not re.match(r'^[a-zA-Z\s]+$', contact_name):
        return Response({"error": "Contact name must contain only letters and spaces."}, status=status.HTTP_400_BAD_REQUEST)
    if len(contact_name.strip()) < 3:
        return Response({"error": "Contact name must be at least 3 characters long."}, status=status.HTTP_400_BAD_REQUEST)

    if len(event_title.strip()) < 5:
        return Response({"error": "Trip title must be at least 5 characters long."}, status=status.HTTP_400_BAD_REQUEST)

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
        'important_notes': list(important_notes),
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
        trip_day = day.get('trip_day')
        trip_date_str = day.get('trip_date')
        notes = day.get('notes', '')
        items = day.get('items', [])
        
        # Validate meal plan choices at day level if present
        meal_plan = day.get('meal_plan')
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

        try:
            day_num = int(trip_day)
        except (ValueError, TypeError):
            return Response({"error": f"Invalid trip_day '{trip_day}' for day index {index}. It must be an integer."}, status=status.HTTP_400_BAD_REQUEST)

        if not (1 <= day_num <= expected_total_days):
            return Response({"error": f"trip_day {day_num} is out of range. It must be between 1 and {expected_total_days}."}, status=status.HTTP_400_BAD_REQUEST)

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

        # If items are not provided, check for legacy fields
        if not items:
            place = day.get('place')
            description = day.get('description', '')
            
            if place:
                # Build legacy item
                items = [{
                    'item_type': 'Sightseeing',
                    'place': place,
                    'description': description,
                    'start_time': '09:00',
                    'end_time': '18:00',
                    'sequence': 1
                }]
                if meal_plan:
                    items.append({
                        'item_type': 'Meal',
                        'description': f"Meals: {meal_plan}",
                        'start_time': '19:00',
                        'end_time': '20:00',
                        'sequence': 2
                    })
            else:
                return Response({"error": f"Day entry at index {index} has no items and is missing legacy place/attraction."}, status=status.HTTP_400_BAD_REQUEST)

        validated_items = []
        for idx, item in enumerate(items):
            item_type = item.get('item_type', 'Sightseeing')
            description = item.get('description', '')
            seq = item.get('sequence', idx + 1)
            
            # Start/end time strings
            start_time_str = item.get('start_time')
            end_time_str = item.get('end_time')

            # Validate time formats if provided
            if start_time_str and not _parse_time(start_time_str):
                return Response({"error": f"Invalid start_time format '{start_time_str}' on Day {day_num}, item {idx+1}."}, status=status.HTTP_400_BAD_REQUEST)
            if end_time_str and not _parse_time(end_time_str):
                return Response({"error": f"Invalid end_time format '{end_time_str}' on Day {day_num}, item {idx+1}."}, status=status.HTTP_400_BAD_REQUEST)

            city_id = item.get('city')
            place_id = item.get('place')

            resolved_city_id = None
            resolved_place_id = None

            if item_type == 'Transport':
                from_city_id = item.get('from_city')
                to_city_id = item.get('to_city')
                departure_time_str = item.get('departure_time')
                arrival_time_str = item.get('arrival_time')
                transport_mode = item.get('transport_mode')
                duration = item.get('duration')

                if not from_city_id or not to_city_id:
                    return Response({"error": f"Transport items on Day {day_num} require 'from_city' and 'to_city'."}, status=status.HTTP_400_BAD_REQUEST)

                try:
                    City.objects.get(id=from_city_id)
                    City.objects.get(id=to_city_id)
                except City.DoesNotExist:
                    return Response({"error": f"Invalid from_city or to_city UUID on Day {day_num} transport item."}, status=status.HTTP_400_BAD_REQUEST)

                if departure_time_str and not _parse_time(departure_time_str):
                    return Response({"error": f"Invalid departure_time format '{departure_time_str}' on Day {day_num}."}, status=status.HTTP_400_BAD_REQUEST)
                if arrival_time_str and not _parse_time(arrival_time_str):
                    return Response({"error": f"Invalid arrival_time format '{arrival_time_str}' on Day {day_num}."}, status=status.HTTP_400_BAD_REQUEST)

                validated_items.append({
                    'item_type': item_type,
                    'from_city': from_city_id,
                    'to_city': to_city_id,
                    'departure_time': departure_time_str,
                    'arrival_time': arrival_time_str,
                    'transport_mode': transport_mode,
                    'duration': duration,
                    'sequence': seq,
                    'description': description
                })
            else:
                # Sightseeing, Activity, Meal, Hotel
                places_list = item.get('places', [])
                if not places_list and place_id:
                    places_list = [place_id]
                
                # Validation removed: place selection is not compulsory
                
                validated_place_ids = []
                for p_id in places_list:
                    try:
                        place_instance = Place.objects.get(id=p_id)
                        validated_place_ids.append(str(place_instance.id))
                    except Place.DoesNotExist:
                        return Response({"error": f"Place ID {p_id} on Day {day_num} does not exist."}, status=status.HTTP_400_BAD_REQUEST)
                
                resolved_place_id = None
                resolved_city_id = city_id
                if validated_place_ids:
                    first_place_instance = Place.objects.get(id=validated_place_ids[0])
                    resolved_place_id = str(first_place_instance.id)
                    resolved_city_id = str(first_place_instance.city.id) if first_place_instance.city else city_id
                
                if not resolved_city_id and city_id:
                    resolved_city_id = city_id

                validated_items.append({
                    'item_type': item_type,
                    'city': resolved_city_id,
                    'place': resolved_place_id,
                    'places': validated_place_ids,
                    'start_time': start_time_str,
                    'end_time': end_time_str,
                    'sequence': seq,
                    'description': description
                })

        # Derive legacy day-level city/place/meal_plan for Redis cache & serializer backward compatibility
        first_item = validated_items[0] if validated_items else {}
        first_place_id = first_item.get('place')
        first_city_id = first_item.get('city') or first_item.get('from_city')

        legacy_city_name = ""
        if first_city_id:
            try:
                legacy_city_name = City.objects.get(id=first_city_id).name
            except City.DoesNotExist:
                pass
        elif first_place_id:
            try:
                legacy_city_name = Place.objects.get(id=first_place_id).city.name
            except Exception:
                pass

        day_meals = []
        for item in validated_items:
            if item['item_type'] == 'Meal' and item.get('description'):
                meal_val = item['description'].replace("Meals: ", "").strip()
                day_meals.append(meal_val)
        if not day_meals and meal_plan:
            day_meals.append(meal_plan)

        # Collect all place IDs for this day
        all_day_place_ids = []
        for itm in validated_items:
            for pid in itm.get('places', []):
                if pid not in all_day_place_ids:
                    all_day_place_ids.append(pid)
            if itm.get('place') and itm['place'] not in all_day_place_ids:
                all_day_place_ids.append(itm['place'])
        for pid in day.get('places', []):
            if str(pid) not in all_day_place_ids:
                all_day_place_ids.append(str(pid))
        if day.get('place') and str(day['place']) not in all_day_place_ids:
            all_day_place_ids.append(str(day['place']))

        validated_days.append({
            'trip_day': day_num,
            'trip_date': str(day_date),
            'notes': notes,
            'items': validated_items,
            'places': all_day_place_ids,
            # Legacy compatibility fields
            'city': legacy_city_name,
            'place': first_place_id,
            'meal_plan': ", ".join(day_meals) if day_meals else "",
            'description': first_item.get('description', '')
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
        # Update or Create Itinerary in DB
        trip_id = request.data.get('trip_id')
        if trip_id:
            itinerary = Itinerary.objects.get(id=trip_id)
            itinerary.customer_name = draft_data['customer_name']
            itinerary.contact_name = draft_data['contact_name']
            itinerary.event_title = draft_data['event_title']
            itinerary.trip_start_date = _parse_date(draft_data['trip_start_date'])
            itinerary.trip_end_date = _parse_date(draft_data['trip_end_date'])
            itinerary.save()
            # Clear old nested data to replace it
            itinerary.group_prices.all().delete()
            itinerary.days.all().delete()
            itinerary.inclusions.clear()
            itinerary.exclusions.clear()
            itinerary.policies.clear()
            itinerary.important_notes.clear()
            itinerary.places.clear()
        else:
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
        if draft_data.get('important_notes'):
            itinerary.important_notes.add(*draft_data['important_notes'])
        if draft_data.get('places'):
            itinerary.places.add(*draft_data['places'])

        # Extract and deduplicate meals from draft days
        unique_meals = []
        seen_meals = set()
        for day in draft_days:
            meal_plan_str = day.get('meal_plan') or ''
            day_meals = [m.strip() for m in meal_plan_str.split(',') if m.strip()]
            for meal in day_meals:
                meal_lower = meal.lower()
                if meal_lower not in seen_meals:
                    seen_meals.add(meal_lower)
                    # Normalize choice casing to match valid choices: Breakfast, Lunch, Snacks, Dinner
                    matched_meal = meal.title()
                    for valid_meal in ['Breakfast', 'Lunch', 'Snacks', 'Dinner']:
                        if meal_lower == valid_meal.lower():
                            matched_meal = valid_meal
                            break
                    unique_meals.append(matched_meal)
        meals_included_str = ", ".join(unique_meals) if unique_meals else ""

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
                meals_included=meals_included_str,
                travel_price=float(g.get('travel_price', 0.00)),
                travel_type=g.get('travel_type'),
                other_charges=float(g.get('other_charges', 0.00)),
                other_charge_type=g.get('other_charge_type')
            )

        # Create ItineraryDay and ItineraryItem objects
        for day in draft_days:
            day_id = uuid.uuid4()
            
            # Resolve legacy day-level city & place instances
            legacy_place_id = day.get('place')
            legacy_place_instance = None
            legacy_city_instance = None
            if legacy_place_id:
                try:
                    legacy_place_instance = Place.objects.get(id=legacy_place_id)
                    legacy_city_instance = legacy_place_instance.city
                except Place.DoesNotExist:
                    pass
            
            day_instance = ItineraryDay.objects.create(
                id=day_id,
                itinerary=itinerary,
                trip_day=day['trip_day'],
                trip_date=_parse_date(day['trip_date']),
                notes=day.get('notes', ''),
                place=legacy_place_instance,
                city=legacy_city_instance,
                meal_plan=day.get('meal_plan', ''),
                description=day.get('description', '')
            )

            # Set multiple places on ItineraryDay
            day_place_ids = list(day.get('places', []))
            for item in day.get('items', []):
                for pid in item.get('places', []):
                    if str(pid) not in day_place_ids:
                        day_place_ids.append(str(pid))
                if item.get('place') and str(item['place']) not in day_place_ids:
                    day_place_ids.append(str(item['place']))

            if day_place_ids:
                day_instance.places.set(day_place_ids)
                itinerary.places.add(*day_place_ids)

            for item in day.get('items', []):
                item_type = item['item_type']
                
                # Fetch place/city relations
                place_inst = None
                city_inst = None
                place_id = item.get('place')
                city_id = item.get('city')
                
                if place_id:
                    place_inst = Place.objects.get(pk=place_id)
                    city_inst = place_inst.city
                elif city_id:
                    city_inst = City.objects.get(pk=city_id)

                from_city_inst = None
                to_city_inst = None
                from_city_id = item.get('from_city')
                to_city_id = item.get('to_city')
                
                if from_city_id:
                    from_city_inst = City.objects.get(pk=from_city_id)
                if to_city_id:
                    to_city_inst = City.objects.get(pk=to_city_id)

                item_instance = ItineraryItem.objects.create(
                    itinerary_day=day_instance,
                    item_type=item_type,
                    city=city_inst,
                    place=place_inst,
                    start_time=_parse_time(item.get('start_time')),
                    end_time=_parse_time(item.get('end_time')),
                    sequence=item.get('sequence', 0),
                    description=item.get('description', ''),
                    from_city=from_city_inst,
                    to_city=to_city_inst,
                    departure_time=_parse_time(item.get('departure_time')),
                    arrival_time=_parse_time(item.get('arrival_time')),
                    transport_mode=item.get('transport_mode'),
                    duration=item.get('duration')
                )
                
                places_ids = item.get('places', [])
                if not places_ids and place_id:
                    places_ids = [place_id]
                
                if places_ids:
                    item_instance.places.add(*places_ids)

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


@api_view(['GET', 'DELETE', 'PUT'])
@permission_classes([AllowAny])
def itinerary_detail_view(request, pk):
    itinerary = get_object_or_404(Itinerary, pk=pk)
    
    if request.method == 'GET':
        serializer = ItinerarySerializer(itinerary)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    elif request.method == 'DELETE':
        if not request.user or not request.user.is_authenticated:
            pass # allow for now as per @AllowAny or enforce depending on requirements
        itinerary.delete()
        return Response({"message": "Itinerary deleted successfully."}, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        # Simple PUT update for top-level fields (can be expanded for nested updates)
        serializer = ItinerarySerializer(itinerary, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Itinerary updated successfully", "itinerary": serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def itinerary_pdf_view(request, pk):
    itinerary = get_object_or_404(Itinerary, pk=pk)
    
    # Dynamic duration and dates calculation
    if itinerary.trip_start_date and itinerary.trip_end_date:
        days_count = (itinerary.trip_end_date - itinerary.trip_start_date).days + 1
        nights_count = max(0, days_count - 1)
        duration_str = f"{days_count:02d} DAYS / {nights_count:02d} NIGHTS"
        start_date_str = itinerary.trip_start_date.strftime("%d %b %Y")
        end_date_str = itinerary.trip_end_date.strftime("%d %b %Y")
    else:
        duration_str = "01 DAYS / 00 NIGHTS"
        start_date_str = ""
        end_date_str = ""

    # Collect destination cities across days & items
    cities_list = []
    days_data = itinerary.days.all().order_by('trip_day')
    for day in days_data:
        if day.city and day.city.name not in cities_list:
            cities_list.append(day.city.name)
        for item in day.items.all():
            if item.city and item.city.name not in cities_list:
                cities_list.append(item.city.name)
    
    destinations_str = " → ".join(cities_list) if cities_list else "India"

    # Pre-process day-wise information
    for day in days_data:
        if day.trip_date:
            day.trip_date_formatted = day.trip_date.strftime("%d %b (%a)")
        else:
            day.trip_date_formatted = ""
            
        day.ordered_items = day.items.all().order_by('sequence', 'start_time')
        
        # Resolve all places for the day
        all_day_places = list(day.places.all())
        for it in day.ordered_items:
            for p in it.places.all():
                if p not in all_day_places:
                    all_day_places.append(p)
            if it.place and it.place not in all_day_places:
                all_day_places.append(it.place)
        if day.place and day.place not in all_day_places:
            all_day_places.append(day.place)

        day.all_places = all_day_places
        day.resolved_place_names = ", ".join(p.place_name for p in all_day_places) if all_day_places else ""
        day.resolved_place = all_day_places[0] if all_day_places else day.place

        # Photo path resolution: check all day places
        photo_path = None
        for p in all_day_places:
            if p.photo and hasattr(p.photo, 'path'):
                import os
                if os.path.exists(p.photo.path):
                    photo_path = p.photo.path.replace('\\', '/')
                    break
        if not photo_path:
            for item in day.ordered_items:
                if item.place and item.place.photo and hasattr(item.place.photo, 'path'):
                    import os
                    if os.path.exists(item.place.photo.path):
                        photo_path = item.place.photo.path.replace('\\', '/')
                        break
        if not photo_path and day.place and day.place.photo and hasattr(day.place.photo, 'path'):
            import os
            if os.path.exists(day.place.photo.path):
                photo_path = day.place.photo.path.replace('\\', '/')
        day.absolute_photo_path = photo_path

        # Build individual place details list for all places in this day
        places_details_list = []
        for p in all_day_places:
            p_desc = (p.description or "").strip()
            p_photo = None
            if p.photo and hasattr(p.photo, 'path'):
                import os
                if os.path.exists(p.photo.path):
                    p_photo = p.photo.path.replace('\\', '/')
            places_details_list.append({
                'name': p.place_name,
                'description': p_desc,
                'photo_path': p_photo,
            })
        day.places_details_list = places_details_list

        # User's custom day description (if explicitly entered)
        custom_day_desc = (day.description or "").strip()
        day.custom_description = custom_day_desc

        if custom_day_desc:
            day.resolved_description = custom_day_desc
        elif len(places_details_list) == 1:
            day.resolved_description = places_details_list[0]['description']
        elif len(places_details_list) > 1:
            day.resolved_description = ""
        else:
            day.resolved_description = ""

        for item in day.ordered_items:
            item_desc = (item.description or "").strip()
            item_places = list(item.places.all())
            if not item_places and item.place:
                item_places = [item.place]
            item.item_places = item_places
            item.places_display = ", ".join(p.place_name for p in item_places)
            if not item_desc:
                for ip in item_places:
                    if ip.description and ip.description.strip() != day.resolved_description:
                        item_desc = ip.description.strip()
                        break
            item.resolved_description = item_desc

        # Dynamic stay information
        stay_text = ""
        for it in day.ordered_items:
            if it.item_type == 'Hotel':
                if it.place and it.place.place_name:
                    stay_text = it.place.place_name
                elif it.description:
                    stay_text = it.description
                break

        if not stay_text and day.city:
            matching_gp = itinerary.group_prices.filter(hotel__city=day.city).first()
            if matching_gp and matching_gp.hotel:
                stay_text = matching_gp.hotel.name

        if not stay_text:
            any_gp = itinerary.group_prices.filter(hotel__isnull=False).first()
            if any_gp and any_gp.hotel:
                stay_text = any_gp.hotel.name

        if stay_text:
            day.stay_display = f"Stay Night at {stay_text}"
        elif day.city:
            day.stay_display = f"Overnight Stay in {day.city.name}"
        else:
            day.stay_display = "Overnight Stay"

        # Dynamic meal plan code
        meal_str = (day.meal_plan or "").strip()
        if meal_str:
            meals_lower = [m.strip().lower() for m in meal_str.split(',') if m.strip()]
            b = "B" if any("break" in m for m in meals_lower) else "-"
            l = "L" if any("lunch" in m for m in meals_lower) else "-"
            d = "D" if any("dinner" in m for m in meals_lower) else "-"
            if b != "-" or l != "-" or d != "-":
                day.meal_display = f"{b}/{l}/{d}"
            else:
                day.meal_display = meal_str
        elif day.city and day.city.code:
            day.meal_display = day.city.code
        else:
            day.meal_display = ""

    # User / Signatory name resolution
    user = None
    if request.user and request.user.is_authenticated:
        user = request.user
    else:
        # Check token parameter (e.g. from window.open) or HTTP header
        token_str = request.GET.get('token')
        if not token_str:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                token_str = auth_header.split(' ')[1]
        if token_str:
            try:
                from rest_framework_simplejwt.tokens import AccessToken
                from django.contrib.auth.models import User
                validated_token = AccessToken(token_str)
                user_id = validated_token.get('user_id')
                if user_id:
                    user = User.objects.filter(id=user_id).first()
            except Exception:
                pass

    user_name_param = request.GET.get('user_name', '').strip()
    if user_name_param:
        author_name = user_name_param
    elif user:
        full_name = f"{user.first_name} {user.last_name}".strip()
        author_name = full_name or user.username
    else:
        from django.contrib.auth.models import User
        primary_user = User.objects.filter(is_active=True).exclude(username='admin').first() or User.objects.first()
        if primary_user:
            author_name = f"{primary_user.first_name} {primary_user.last_name}".strip() or primary_user.username
        else:
            author_name = "Authorized Manager"

    # Fetch Account info (company details)
    from accounts.models import Account
    account = None
    if user and hasattr(user, 'profile') and user.profile.account:
        account = user.profile.account
    if not account:
        account = Account.objects.first()

    company_logo_path = None
    company_name = ""
    company_phone = ""
    company_fax = ""
    company_email = ""
    company_address = ""

    if account:
        company_name = account.name or ""
        company_phone = account.telephone or ""
        company_fax = account.fax or ""
        company_email = account.email or ""
        company_address = account.address or ""
        if account.logo and hasattr(account.logo, 'path'):
            import os
            if os.path.exists(account.logo.path):
                company_logo_path = account.logo.path.replace('\\', '/')

    # Build pivoted table data for pricing table in row format
    pax_sizes = sorted(list(set(gp.group_size for gp in itinerary.group_prices.all() if gp.group_size)))
    pricing_rows = []

    if itinerary.group_prices.exists():
        grouped_by_hotel = {}
        for gp in itinerary.group_prices.all().order_by('group_size'):
            hotel_key = gp.hotel_id if gp.hotel_id else 'no_hotel'
            if hotel_key not in grouped_by_hotel:
                hotel_obj = gp.hotel
                city_name = ""
                hotel_name = ""
                if hotel_obj:
                    hotel_name = hotel_obj.name
                    city_name = hotel_obj.city.name if hotel_obj.city else ""
                if not city_name:
                    city_name = destinations_str or "India"
                if not hotel_name:
                    hotel_name = "STANDARD HOTEL"
                grouped_by_hotel[hotel_key] = {
                    'city': city_name.upper(),
                    'hotel_name': hotel_name.upper(),
                    'prices_map': {}
                }
            grouped_by_hotel[hotel_key]['prices_map'][gp.group_size] = f"{gp.total_price_per_person:.2f}"

        for h_key, data in grouped_by_hotel.items():
            row_prices = []
            for p in pax_sizes:
                val = data['prices_map'].get(p, "-")
                row_prices.append(val)
            pricing_rows.append({
                'city': data['city'],
                'hotel_name': data['hotel_name'],
                'prices': row_prices
            })
    else:
        pax_sizes = ["-"]
        pricing_rows = [{
            'city': destinations_str.upper() if destinations_str else "INDIA",
            'hotel_name': "STANDARD ACCOMMODATION",
            'prices': ["Contact for Pricing"]
        }]

    def _parse_condition_obj(obj):
        raw_text = (obj.text or "").strip()
        parts = raw_text.split(" | ", 1)
        title = parts[0].strip() if parts else raw_text
        desc = parts[1].strip() if len(parts) > 1 else ""
        return {
            "id": str(obj.id),
            "title": title,
            "description": desc,
            "text": raw_text,
        }

    inclusions_list = [_parse_condition_obj(i) for i in itinerary.inclusions.all()]
    exclusions_list = [_parse_condition_obj(e) for e in itinerary.exclusions.all()]
    policies_list = [_parse_condition_obj(p) for p in itinerary.policies.all()]
    important_notes_list = [_parse_condition_obj(n) for n in itinerary.important_notes.all()]

    context = {
        'itinerary': itinerary,
        'duration_str': duration_str,
        'start_date_str': start_date_str,
        'end_date_str': end_date_str,
        'destinations_str': destinations_str,
        'days_data': days_data,
        'group_prices': itinerary.group_prices.all(),
        'pax_sizes': pax_sizes,
        'pricing_rows': pricing_rows,
        'inclusions': inclusions_list,
        'exclusions': exclusions_list,
        'policies': policies_list,
        'important_notes': important_notes_list,
        'current_date': datetime.now().strftime("%d/%m/%Y"),
        'from_user': author_name,
        'company_name': company_name,
        'company_logo': company_logo_path,
        'company_phone': company_phone,
        'company_fax': company_fax,
        'company_email': company_email,
        'company_address': company_address,
    }
    
    html_string = render_to_string('itineraries/itinerary_pdf.html', context)
    
    def link_callback(uri, rel):
        import os
        from django.conf import settings
        if os.path.isfile(uri):
            return uri
        if uri.startswith(settings.MEDIA_URL):
            path = os.path.join(settings.MEDIA_ROOT, uri.replace(settings.MEDIA_URL, "", 1))
        elif uri.startswith(settings.STATIC_URL):
            path = os.path.join(settings.STATIC_ROOT, uri.replace(settings.STATIC_URL, "", 1))
        else:
            path = os.path.join(settings.BASE_DIR, uri)
        if os.path.isfile(path):
            return path
        return uri

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="itinerary_{itinerary.id}.pdf"'
    
    pisa_status = pisa.CreatePDF(
        html_string,
        dest=response,
        link_callback=link_callback,
    )
    if pisa_status.err:
        return Response({"error": "Failed to generate PDF"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    return response


@api_view(['GET'])
@permission_classes([AllowAny])
def trip_inventory_view(request):
    from .serializers import TripInventorySerializer
    itineraries = Itinerary.objects.all().order_by('-created_at')
    serializer = TripInventorySerializer(itineraries, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
