import uuid
from django.db import models
from conditions.models import Inclusion, Exclusion, Policy
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
    places = models.ManyToManyField(Place, blank=True)
    hotel = models.ForeignKey(Hotel, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.event_title} for {self.customer_name}"


class ItineraryGroupPrice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    itinerary = models.ForeignKey(Itinerary, related_name='group_prices', on_delete=models.CASCADE)
    group_size = models.IntegerField()  # e.g. 20, 15, 12
    hotel_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    meal_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    travel_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    other_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_price_per_person = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_group_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
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
    city = models.CharField(max_length=100)
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='itinerary_days')
    meal_plan = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    trip_day = models.IntegerField()  # e.g. 1, 2, 3
    trip_date = models.DateField()    # must fall between start and end date
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Day {self.trip_day}: {self.place} ({self.city})"
