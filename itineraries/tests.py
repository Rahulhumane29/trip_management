from datetime import date
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.cache import cache
from places.models import Place
from itineraries.models import Itinerary, ItineraryDay

class ItineraryStep2ValidationTests(APITestCase):

    def setUp(self):
        # Create user and authenticate
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.client.force_authenticate(user=self.user)
        
        # Create location details
        from places.models import Country, City
        self.country = Country.objects.create(name="France")
        self.city = City.objects.create(name="Paris", country=self.country)
        
        # Create a place
        self.place = Place.objects.create(
            country=self.country,
            city=self.city,
            place_name="Eiffel Tower"
        )
        
        # Pre-populate Step 1 draft in cache
        self.draft_token = "test_token_123"
        self.draft_data = {
            'customer_name': 'John Doe',
            'contact_name': 'Jane Doe',
            'event_title': 'Paris Tour',
            'trip_start_date': '2026-09-01',
            'trip_end_date': '2026-09-03',  # 3 days: 09-01, 09-02, 09-03
            'inclusions': [],
            'exclusions': [],
            'policies': [],
            'places': [str(self.place.id)]
        }
        cache.set(f"itinerary_draft:{self.draft_token}", self.draft_data, timeout=8600)

    def test_step2_success_with_auto_dates(self):
        data = {
            'draft_token': self.draft_token,
            'days': [
                {
                    'place': str(self.place.id),
                    'meal_plan': 'Breakfast',
                    'trip_day': 1
                },
                {
                    'place': str(self.place.id),
                    'meal_plan': 'Lunch',
                    'trip_day': 3
                },
                {
                    'place': str(self.place.id),
                    'meal_plan': 'Dinner',
                    'trip_day': 2
                }
            ]
        }
        response = self.client.post('/api/itinerary/step2/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify cached days are chronologically sorted and dates/cities are auto-assigned
        cached_days = cache.get(f"itinerary_draft_days:{self.draft_token}")
        self.assertIsNotNone(cached_days)
        self.assertEqual(len(cached_days), 3)
        self.assertEqual(cached_days[0]['trip_day'], 1)
        self.assertEqual(cached_days[0]['trip_date'], '2026-09-01')
        self.assertEqual(cached_days[0]['city'], 'Paris')  # Derived from Place
        self.assertEqual(cached_days[1]['trip_day'], 2)
        self.assertEqual(cached_days[1]['trip_date'], '2026-09-02')
        self.assertEqual(cached_days[1]['city'], 'Paris')  # Derived from Place
        self.assertEqual(cached_days[2]['trip_day'], 3)
        self.assertEqual(cached_days[2]['trip_date'], '2026-09-03')
        self.assertEqual(cached_days[2]['city'], 'Paris')  # Derived from Place

    def test_step2_fail_incorrect_number_of_days(self):
        # 3-day trip, but we send 2 days
        data = {
            'draft_token': self.draft_token,
            'days': [
                {
                    'city': 'Paris',
                    'place': str(self.place.id),
                    'meal_plan': 'Breakfast',
                    'trip_day': 1
                },
                {
                    'city': 'Paris',
                    'place': str(self.place.id),
                    'meal_plan': 'Dinner',
                    'trip_day': 2
                }
            ]
        }
        response = self.client.post('/api/itinerary/step2/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("does not match the trip duration", response.data['error'])

    def test_step2_fail_duplicate_trip_days(self):
        # 3-day trip, but we send duplicate trip_day
        data = {
            'draft_token': self.draft_token,
            'days': [
                {
                    'city': 'Paris',
                    'place': str(self.place.id),
                    'meal_plan': 'Breakfast',
                    'trip_day': 1
                },
                {
                    'city': 'Paris',
                    'place': str(self.place.id),
                    'meal_plan': 'Dinner',
                    'trip_day': 1
                },
                {
                    'city': 'Paris',
                    'place': str(self.place.id),
                    'meal_plan': 'Lunch',
                    'trip_day': 3
                }
            ]
        }
        response = self.client.post('/api/itinerary/step2/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Duplicate trip_day entries", response.data['error'])

    def test_step2_fail_out_of_bounds_trip_day(self):
        data = {
            'draft_token': self.draft_token,
            'days': [
                {
                    'city': 'Paris',
                    'place': str(self.place.id),
                    'meal_plan': 'Breakfast',
                    'trip_day': 1
                },
                {
                    'city': 'Paris',
                    'place': str(self.place.id),
                    'meal_plan': 'Dinner',
                    'trip_day': 2
                },
                {
                    'city': 'Paris',
                    'place': str(self.place.id),
                    'meal_plan': 'Lunch',
                    'trip_day': 4  # Trip is only 3 days
                }
            ]
        }
        response = self.client.post('/api/itinerary/step2/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("out of range", response.data['error'])

    def test_step2_validate_provided_date_success(self):
        # Passing correct trip_date matches
        data = {
            'draft_token': self.draft_token,
            'days': [
                {
                    'city': 'Paris',
                    'place': str(self.place.id),
                    'meal_plan': 'Breakfast',
                    'trip_day': 1,
                    'trip_date': '2026-09-01'
                },
                {
                    'city': 'Paris',
                    'place': str(self.place.id),
                    'meal_plan': 'Dinner',
                    'trip_day': 2,
                    'trip_date': '2026-09-02'
                },
                {
                    'city': 'Paris',
                    'place': str(self.place.id),
                    'meal_plan': 'Lunch',
                    'trip_day': 3,
                    'trip_date': '2026-09-03'
                }
            ]
        }
        response = self.client.post('/api/itinerary/step2/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_step2_validate_provided_date_mismatch(self):
        # Passing incorrect trip_date fails
        data = {
            'draft_token': self.draft_token,
            'days': [
                {
                    'city': 'Paris',
                    'place': str(self.place.id),
                    'meal_plan': 'Breakfast',
                    'trip_day': 1,
                    'trip_date': '2026-09-01'
                },
                {
                    'city': 'Paris',
                    'place': str(self.place.id),
                    'meal_plan': 'Dinner',
                    'trip_day': 2,
                    'trip_date': '2026-09-03'  # Should be 2026-09-02
                },
                {
                    'city': 'Paris',
                    'place': str(self.place.id),
                    'meal_plan': 'Lunch',
                    'trip_day': 3,
                    'trip_date': '2026-09-03'
                }
            ]
        }
        response = self.client.post('/api/itinerary/step2/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("does not match the chronological date", response.data['error'])

    def test_generate_pdf_success(self):
        # Create an Itinerary instance in DB
        itinerary = Itinerary.objects.create(
            customer_name="Alice",
            contact_name="Bob",
            event_title="Romantic Paris",
            trip_start_date=date(2026, 9, 1),
            trip_end_date=date(2026, 9, 3)
        )
        # Create ItineraryDay
        ItineraryDay.objects.create(
            itinerary=itinerary,
            city=self.city,
            place=self.place,
            meal_plan="Breakfast",
            trip_day=1,
            trip_date=date(2026, 9, 1)
        )
        
        response = self.client.get(f'/api/itinerary/{itinerary.id}/pdf/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['content-type'], 'application/pdf')
        self.assertTrue(len(response.content) > 0)

    def test_step2_invalid_meal_plan(self):
        data = {
            'draft_token': self.draft_token,
            'days': [
                {
                    'place': str(self.place.id),
                    'meal_plan': 'Pizza',  # Invalid meal option
                    'trip_day': 1
                },
                {
                    'place': str(self.place.id),
                    'meal_plan': 'Lunch',
                    'trip_day': 3
                },
                {
                    'place': str(self.place.id),
                    'meal_plan': 'Dinner',
                    'trip_day': 2
                }
            ]
        }
        response = self.client.post('/api/itinerary/step2/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid meal choice", response.data['error'])

    def test_submit_group_price_choices(self):
        # Create a test Hotel
        from hotels.models import Hotel
        test_hotel = Hotel.objects.create(
            name="Test Grand Hotel",
            city=self.city,
            country=self.country,
            star_rating=5
        )

        # Cache step 1 and step 2 info
        cache.set(f"itinerary_draft:{self.draft_token}", self.draft_data, timeout=8600)
        cache.set(f"itinerary_draft_days:{self.draft_token}", [
            {
                'city': 'Paris',
                'place': str(self.place.id),
                'meal_plan': 'Breakfast, Lunch, Dinner',
                'description': '',
                'trip_day': 1,
                'trip_date': '2026-09-01',
                'notes': ''
            },
            {
                'city': 'Paris',
                'place': str(self.place.id),
                'meal_plan': 'Lunch',
                'description': '',
                'trip_day': 2,
                'trip_date': '2026-09-02',
                'notes': ''
            },
            {
                'city': 'Paris',
                'place': str(self.place.id),
                'meal_plan': 'Snacks',
                'description': '',
                'trip_day': 3,
                'trip_date': '2026-09-03',
                'notes': ''
            }
        ], timeout=8600)

        submit_data = {
            'draft_token': self.draft_token,
            'hotel': None,
            'groups': [
                {
                    'group_size': 15,
                    'hotel': str(test_hotel.id),
                    'hotel_price': 100.00,
                    'meal_price': 50.00,
                    'meals_included': 'Breakfast, Lunch',
                    'travel_price': 80.00,
                    'travel_type': 'flight',
                    'other_charges': 20.00,
                    'other_charge_type': 'place_charges'
                }
            ]
        }
        response = self.client.post('/api/itinerary/submit/', submit_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, msg=response.content)

        # Verify database and verify fields are saved
        saved_itinerary = Itinerary.objects.get(customer_name='John Doe')
        group_price = saved_itinerary.group_prices.first()
        self.assertEqual(group_price.travel_type, 'flight')
        self.assertEqual(group_price.other_charge_type, 'place_charges')
        self.assertEqual(group_price.hotel, test_hotel)
        # meals_included is now automatically populated from unique meals across all days (Day 1: Breakfast, Lunch, Dinner; Day 2: Lunch; Day 3: Snacks)
        self.assertEqual(group_price.meals_included, 'Breakfast, Lunch, Dinner, Snacks')
        self.assertEqual(group_price.total_price_per_person, 250.00)
        
        # Verify Day 1 saved successfully with multiple meals
        day1 = saved_itinerary.days.get(trip_day=1)
        self.assertEqual(day1.meal_plan, 'Breakfast, Lunch, Dinner')

    def test_submit_meals_included_deduplication(self):
        # Cache step 1 and step 2 info where a meal is selected multiple times across days
        cache.set(f"itinerary_draft:{self.draft_token}", self.draft_data, timeout=8600)
        cache.set(f"itinerary_draft_days:{self.draft_token}", [
            {
                'city': 'Paris',
                'place': str(self.place.id),
                'meal_plan': 'Breakfast, Lunch',
                'description': '',
                'trip_day': 1,
                'trip_date': '2026-09-01',
                'notes': ''
            },
            {
                'city': 'Paris',
                'place': str(self.place.id),
                'meal_plan': 'Lunch, Dinner',
                'description': '',
                'trip_day': 2,
                'trip_date': '2026-09-02',
                'notes': ''
            },
            {
                'city': 'Paris',
                'place': str(self.place.id),
                'meal_plan': 'Breakfast, Snacks',
                'description': '',
                'trip_day': 3,
                'trip_date': '2026-09-03',
                'notes': ''
            }
        ], timeout=8600)

        submit_data = {
            'draft_token': self.draft_token,
            'groups': [
                {
                    'group_size': 10,
                    'hotel': None,
                    'hotel_price': 100.00,
                    'meal_price': 50.00,
                    'meals_included': '', # empty, should be set by backend
                    'travel_price': 80.00,
                    'travel_type': 'bus',
                    'other_charges': 20.00,
                    'other_charge_type': 'place_charges'
                }
            ]
        }
        response = self.client.post('/api/itinerary/submit/', submit_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        saved_itinerary = Itinerary.objects.get(customer_name='John Doe')
        group_price = saved_itinerary.group_prices.first()
        # Should contain 'Breakfast, Lunch, Dinner, Snacks' without duplication
        self.assertEqual(group_price.meals_included, 'Breakfast, Lunch, Dinner, Snacks')
