import uuid
from django.db import models

class Country(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class State(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='states')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('name', 'country')

    def __str__(self):
        return f"{self.name}, {self.country.name}"

class City(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name='cities', null=True, blank=True)
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='cities')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('name', 'state', 'country')
        verbose_name_plural = "Cities"

    def __str__(self):
        if self.state:
            return f"{self.name} ({self.state.name}, {self.country.name})"
        return f"{self.name} ({self.country.name})"

class Place(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    country = models.ForeignKey(Country, on_delete=models.PROTECT, null=True, blank=True)
    state = models.ForeignKey(State, on_delete=models.PROTECT, null=True, blank=True)
    city = models.ForeignKey(City, on_delete=models.PROTECT, null=True, blank=True)
    place_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    photo = models.FileField(upload_to='places/photos/', blank=True, null=True)
    status = models.CharField(max_length=20, default='Active', choices=[('Active', 'Active'), ('Inactive', 'Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        city_name = self.city.name if self.city else "Unknown City"
        country_name = self.country.name if self.country else "Unknown Country"
        return f"{self.place_name} ({city_name}, {country_name})"
