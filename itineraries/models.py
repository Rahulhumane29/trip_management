import uuid
from django.db import models
from conditions.models import Inclusion, Exclusion, Policy, ImportantNote
from hotels.models import Hotel
from places.models import Place

class Itinerary(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer_name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255)
    event_title = models.CharField(max_length=255)
    trip_start_date = models.DateField()
    trip_end_date = models.DateField()
    inclusions = models.ManyToManyField(Inclusion, blank=True)
    exclusions = models.ManyToManyField(Exclusion, blank=True)
    policies = models.ManyToManyField(Policy, blank=True)
    important_notes = models.ManyToManyField(ImportantNote, blank=True)
    places = models.ManyToManyField(Place, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.event_title} for {self.customer_name}"


class ItineraryGroupPrice(models.Model):
    TRAVEL_CHOICES = [
        ('bus', 'Bus'),
        ('train', 'Train'),
        ('flight', 'Flight'),
        ('taxi', 'Taxi'),
    ]
    OTHER_CHARGE_CHOICES = [
        ('place_charges', 'Place Charges'),
        ('extra_charges', 'Extra Charges'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    itinerary = models.ForeignKey(Itinerary, related_name='group_prices', on_delete=models.CASCADE)
    group_size = models.IntegerField()  # e.g. 20, 15, 12
    hotel = models.ForeignKey(Hotel, on_delete=models.SET_NULL, null=True, blank=True)
    hotel_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    meal_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    meals_included = models.CharField(max_length=255, blank=True, null=True)
    travel_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    travel_type = models.CharField(max_length=20, choices=TRAVEL_CHOICES, blank=True, null=True)
    other_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    other_charge_type = models.CharField(max_length=25, choices=OTHER_CHARGE_CHOICES, blank=True, null=True)
    total_price_per_person = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_group_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.meals_included:
            valid_meals = {'Breakfast', 'Lunch', 'Snacks', 'Dinner'}
            submitted_meals = [m.strip() for m in self.meals_included.split(',') if m.strip()]
            for meal in submitted_meals:
                matched = None
                for vm in valid_meals:
                    if meal.lower() == vm.lower():
                        matched = vm
                        break
                if not matched:
                    raise ValidationError(
                        f"Invalid meal choice '{meal}' in group price. Valid choices are Breakfast, Lunch, Snacks, Dinner."
                    )

    def save(self, *args, **kwargs):
        self.clean()
        # Calculate per-person total and overall group total automatically
        self.total_price_per_person = (
            self.hotel_price + 
            self.meal_price + 
            self.travel_price + 
            self.other_charges
        )
        self.total_group_price = self.total_price_per_person * self.group_size
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Group of {self.group_size} - Per-person total: {self.total_price_per_person}"


class ItineraryDay(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    itinerary = models.ForeignKey(Itinerary, related_name='days', on_delete=models.CASCADE)
    city = models.ForeignKey('places.City', on_delete=models.PROTECT, null=True, blank=True)
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='itinerary_days', null=True, blank=True)
    meal_plan = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    trip_day = models.IntegerField()  # e.g. 1, 2, 3
    trip_date = models.DateField()    # must fall between start and end date
    notes = models.TextField(blank=True, null=True)

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.place and not self.city:
            self.city = self.place.city
            
        if self.meal_plan:
            valid_meals = {'Breakfast', 'Lunch', 'Snacks', 'Dinner'}
            submitted_meals = [m.strip() for m in self.meal_plan.split(',') if m.strip()]
            for meal in submitted_meals:
                matched = None
                for vm in valid_meals:
                    if meal.lower() == vm.lower():
                        matched = vm
                        break
                if not matched:
                    raise ValidationError(
                        f"Invalid meal choice '{meal}'. Valid choices are Breakfast, Lunch, Snacks, Dinner."
                    )

        if self.trip_date and self.itinerary:
            if not (self.itinerary.trip_start_date <= self.trip_date <= self.itinerary.trip_end_date):
                raise ValidationError(
                    f"Trip date {self.trip_date} must be between the itinerary start date ({self.itinerary.trip_start_date}) and end date ({self.itinerary.trip_end_date})."
                )

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        if self.place:
            return f"Day {self.trip_day}: {self.place} ({self.city})"
        return f"Day {self.trip_day}: Date {self.trip_date}"


class ItineraryItem(models.Model):
    ITEM_TYPES = [
        ('Sightseeing', 'Sightseeing'),
        ('Activity', 'Activity'),
        ('Meal', 'Meal'),
        ('Hotel', 'Hotel'),
        ('Transport', 'Transport'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    itinerary_day = models.ForeignKey(ItineraryDay, related_name='items', on_delete=models.CASCADE)
    item_type = models.CharField(max_length=20, choices=ITEM_TYPES)
    city = models.ForeignKey('places.City', on_delete=models.PROTECT, null=True, blank=True, related_name='itinerary_items')
    place = models.ForeignKey(Place, on_delete=models.SET_NULL, null=True, blank=True, related_name='itinerary_items')
    places = models.ManyToManyField(Place, blank=True, related_name='itinerary_items_multi')
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    sequence = models.IntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    
    # Transport details
    from_city = models.ForeignKey('places.City', on_delete=models.PROTECT, null=True, blank=True, related_name='transport_from_items')
    to_city = models.ForeignKey('places.City', on_delete=models.PROTECT, null=True, blank=True, related_name='transport_to_items')
    departure_time = models.TimeField(null=True, blank=True)
    arrival_time = models.TimeField(null=True, blank=True)
    transport_mode = models.CharField(max_length=50, null=True, blank=True)
    duration = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        ordering = ['sequence', 'start_time']

    def __str__(self):
        return f"{self.item_type} - {self.sequence} (Day {self.itinerary_day.trip_day})"

