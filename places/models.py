import uuid
from django.db import models

class Place(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    place_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    photo = models.FileField(upload_to='places/photos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.place_name} ({self.city}, {self.country})"
